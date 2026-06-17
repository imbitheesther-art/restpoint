#!/usr/bin/env python3
"""
Python Fallback Billing Service
This service runs independently and can take over if the Node.js billing service fails.
It ensures billing NEVER stops, even during failures.
"""

from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime, timedelta
import logging
from logging.handlers import RotatingFileHandler
import json

app = Flask(__name__)

# Configure logging
if not os.path.exists('logs'):
    os.makedirs('logs')

handler = RotatingFileHandler('logs/python-billing.log', maxBytes=10000000, backupCount=5)
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
app.logger.addHandler(handler)
app.logger.setLevel(logging.INFO)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': 'tenant_tracking'
}

def get_db_connection():
    """Create database connection"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        app.logger.error(f'Database connection error: {e}')
        raise

def calculate_daily_charges(deceased_id, tenant_slug):
    """
    Calculate daily charges for deceased - Python implementation
    This is a standalone implementation that matches the Node.js logic
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get deceased details
        cursor.execute("""
            SELECT d.*, 
                DATEDIFF(NOW(), d.date_admitted) as days_admitted,
                DATEDIFF(NOW(), d.date_of_death) as days_since_death
            FROM deceased d
            WHERE d.id = %s AND d.tenant_slug = %s
        """, (deceased_id, tenant_slug))
        
        deceased = cursor.fetchone()
        if not deceased:
            raise Exception(f"Deceased not found: {deceased_id}")

        # Get tenant settings
        cursor.execute("""
            SELECT daily_rate, embalming_rate, storage_rate 
            FROM tenant_settings 
            WHERE tenant_slug = %s
        """, (tenant_slug,))
        
        settings = cursor.fetchone()
        daily_rate = settings['daily_rate'] if settings else 1500
        embalming_rate = settings['embalming_rate'] if settings else 3000
        storage_rate = settings['storage_rate'] if settings else 500

        # Calculate charges
        days_admitted = deceased['days_admitted'] or 1
        base_charges = days_admitted * daily_rate
        
        # Additional charges
        additional_charges = 0
        if deceased.get('embalming'):
            additional_charges += embalming_rate
        if deceased.get('cold_storage'):
            additional_charges += storage_rate * days_admitted

        total_daily_charge = base_charges + additional_charges

        cursor.close()
        conn.close()

        return {
            'deceasedId': deceased_id,
            'tenantSlug': tenant_slug,
            'daysAdmitted': days_admitted,
            'dailyRate': daily_rate,
            'baseCharges': base_charges,
            'additionalCharges': additional_charges,
            'totalDailyCharge': total_daily_charge,
            'calculatedAt': datetime.now().isoformat()
        }

    except Error as e:
        app.logger.error(f'Error calculating charges: {e}')
        raise

def process_daily_billing(tenant_slug):
    """
    Process daily billing for all active deceased in a tenant
    """
    results = {
        'success': True,
        'tenant': tenant_slug,
        'processed': 0,
        'succeeded': 0,
        'failed': 0,
        'errors': [],
        'timestamp': datetime.now().isoformat()
    }

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get all active deceased
        cursor.execute("""
            SELECT id, deceased_id, full_name, date_admitted, status
            FROM deceased 
            WHERE tenant_slug = %s AND status IN ('admitted', 'active')
        """, (tenant_slug,))
        
        deceased_list = cursor.fetchall()
        app.logger.info(f'Found {len(deceased_list)} deceased records to bill for {tenant_slug}')

        for deceased in deceased_list:
            try:
                results['processed'] += 1
                
                # Calculate charges
                charges = calculate_daily_charges(deceased['id'], tenant_slug)
                
                # Save billing record
                cursor.execute("""
                    INSERT INTO daily_billing 
                    (deceased_id, tenant_slug, days_admitted, daily_rate, base_charges, 
                     additional_charges, total_charge, billing_date, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, CURDATE(), %s)
                    ON DUPLICATE KEY UPDATE
                    days_admitted = VALUES(days_admitted),
                    base_charges = VALUES(base_charges),
                    additional_charges = VALUES(additional_charges),
                    total_charge = VALUES(total_charge),
                    updated_at = VALUES(created_at)
                """, (
                    deceased['id'],
                    tenant_slug,
                    charges['daysAdmitted'],
                    charges['dailyRate'],
                    charges['baseCharges'],
                    charges['additionalCharges'],
                    charges['totalDailyCharge'],
                    datetime.now()
                ))
                
                # Update deceased billing field
                cursor.execute("""
                    UPDATE deceased 
                    SET billing = billing + %s 
                    WHERE id = %s
                """, (charges['totalDailyCharge'], deceased['id']))
                
                conn.commit()
                
                results['succeeded'] += 1
                app.logger.info(f'✓ Billed {deceased["full_name"]}: KES {charges["totalDailyCharge"]}')

            except Exception as e:
                results['failed'] += 1
                results['errors'].append({
                    'deceasedId': deceased['id'],
                    'name': deceased['full_name'],
                    'error': str(e)
                })
                app.logger.error(f'✗ Failed to bill {deceased["full_name"]}: {e}')

        cursor.close()
        conn.close()

        app.logger.info(f'Python billing completed for {tenant_slug}: {results["succeeded"]}/{results["processed"]} succeeded')

    except Exception as e:
        app.logger.error(f'Fatal error in Python billing for {tenant_slug}: {e}')
        results['success'] = False
        results['fatalError'] = str(e)

    return results

# ============================================
# API ROUTES
# ============================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'UP',
        'service': 'python-billing-fallback',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/billing/process', methods=['POST'])
def process_billing():
    """Process billing for a tenant"""
    try:
        data = request.get_json()
        tenant_slug = data.get('tenant_slug')

        if not tenant_slug:
            return jsonify({
                'success': False,
                'message': 'tenant_slug is required'
            }), 400

        app.logger.info(f'Python fallback processing billing for: {tenant_slug}')
        result = process_daily_billing(tenant_slug)

        return jsonify({
            'success': True,
            'fallback': True,
            'data': result
        })

    except Exception as e:
        app.logger.error(f'Python billing failed: {e}')
        return jsonify({
            'success': False,
            'fallback': True,
            'error': str(e)
        }), 500

@app.route('/api/billing/calculate', methods=['POST'])
def calculate_charges():
    """Calculate charges for specific deceased"""
    try:
        data = request.get_json()
        deceased_id = data.get('deceased_id')
        tenant_slug = data.get('tenant_slug')

        if not deceased_id or not tenant_slug:
            return jsonify({
                'success': False,
                'message': 'deceased_id and tenant_slug are required'
            }), 400

        charges = calculate_daily_charges(deceased_id, tenant_slug)

        return jsonify({
            'success': True,
            'data': charges
        })

    except Exception as e:
        app.logger.error(f'Python calculate charges failed: {e}')
        return jsonify({
            'success': False,
            'message': 'Calculation failed',
            'error': str(e)
        }), 500

@app.route('/api/billing/status', methods=['GET'])
def billing_status():
    """Get billing service status"""
    return jsonify({
        'success': True,
        'service': 'python-billing-fallback',
        'status': 'running',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5021))
    app.logger.info(f'Starting Python Billing Fallback Service on port {port}')
    app.run(host='0.0.0.0', port=port, debug=False)
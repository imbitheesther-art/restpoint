import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HardHat,
  Home,
  ArrowLeft,
  Hammer,
  AlertTriangle,
  Wrench,
  Clock,
  Users,
  Sparkles,
  TrafficCone
} from "lucide-react";

const Construction404 = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [progress, setProgress] = useState(0);

  // Get tenant slug from URL params or localStorage
  const getTenantSlug = () => {
    return slug ||
      localStorage.getItem('tenantSlug') ||
      localStorage.getItem('tenant_slug') ||
      (() => {
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          return user.tenantSlug || user.tenant?.slug || 'default';
        } catch {
          return 'default';
        }
      })();
  };

  useEffect(() => {
    // Simulate progress animation
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 85) {
          clearInterval(timer);
          return 85;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  const handleGoBack = () => navigate(-1);
  const handleGoHome = () => {
    const tenantSlug = getTenantSlug();
    navigate(`/tenant/${tenantSlug}/all-deceased`);
  };

  const styles = `
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% { transform: translate3d(0, 0, 0); }
      40%, 43% { transform: translate3d(0, -20px, 0); }
      70% { transform: translate3d(0, -10px, 0); }
      90% { transform: translate3d(0, -5px, 0); }
    }

    @keyframes hammerSwing {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-30deg); }
      75% { transform: rotate(30deg); }
    }

    @keyframes coneWobble {
      0%, 100% { transform: rotate(-5deg); }
      50% { transform: rotate(5deg); }
    }

    @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0); }
      50% { opacity: 1; transform: scale(1); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
    }

    @keyframes constructionLight {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }

    .construction-animation { animation: bounce 2s ease-in-out infinite; }
    .hammer-animation { animation: hammerSwing 1s ease-in-out infinite; }
    .cone-animation { animation: coneWobble 2s ease-in-out infinite; }
    .sparkle-animation { animation: sparkle 2s ease-in-out infinite; }
    .float-animation { animation: float 3s ease-in-out infinite; }
    .light-animation { animation: constructionLight 1.5s ease-in-out infinite; }
  `;

  return (
    <>
      <style>{styles}</style>

      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          backgroundImage: `
            linear-gradient(45deg, rgba(255, 107, 53, 0.1) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(255, 107, 53, 0.1) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(255, 107, 53, 0.1) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(255, 107, 53, 0.1) 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-8">

              {/* Construction Header */}
              <div className="text-center mb-4">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <TrafficCone size={32} className="text-warning cone-animation me-3" />
                  <HardHat size={40} className="text-warning construction-animation me-3" />
                  <TrafficCone size={32} className="text-warning cone-animation" />
                </div>
                <div className="construction-bar bg-warning rounded mb-4" style={{ height: '6px' }}></div>
              </div>

              <div className="card border-0 shadow-lg position-relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="position-absolute top-0 start-0 w-100 h-100">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="position-absolute sparkle-animation"
                      style={{
                        top: `${20 + i * 15}%`,
                        left: `${10 + i * 20}%`,
                        animationDelay: `${i * 0.5}s`
                      }}
                    >
                      <Sparkles size={16} className="text-warning opacity-50" />
                    </div>
                  ))}
                </div>

                <div className="card-body p-5 text-center position-relative">

                  {/* Main Content */}
                  <div className="mb-4">
                    <AlertTriangle size={60} className="text-warning float-animation mb-3" />
                    <h1 className="display-3 fw-bold text-dark mb-2">404</h1>
                    <h2 className="h1 fw-bold text-dark mb-3">
                      Under Construction
                    </h2>
                    <p className="lead text-muted fs-5">
                      We're building something extraordinary! 🚧<br />
                      This page will be ready for you soon.
                    </p>
                  </div>

                  {/* Construction Team Animation */}
                  <div className="row mb-4">
                    <div className="col-3 text-center">
                      <div className="hammer-animation">
                        <Hammer size={28} className="text-warning" />
                      </div>
                      <small className="text-muted d-block mt-2">Construction</small>
                    </div>
                    <div className="col-3 text-center">
                      <div className="light-animation">
                        <Wrench size={28} className="text-warning" />
                      </div>
                      <small className="text-muted d-block mt-2">Maintenance</small>
                    </div>
                    <div className="col-3 text-center">
                      <div className="float-animation">
                        <Users size={28} className="text-warning" />
                      </div>
                      <small className="text-muted d-block mt-2">Team</small>
                    </div>
                    <div className="col-3 text-center">
                      <div className="sparkle-animation">
                        <Sparkles size={28} className="text-warning" />
                      </div>
                      <small className="text-muted d-block mt-2">Quality</small>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">
                        <Clock size={16} className="me-1" />
                        Building in progress...
                      </span>
                      <span className="text-warning fw-bold fs-5">{progress}%</span>
                    </div>
                    <div className="progress" style={{ height: '12px', borderRadius: '10px' }}>
                      <div
                        className="progress-bar bg-warning progress-bar-striped progress-bar-animated"
                        style={{ width: `${progress}%`, borderRadius: '10px' }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-grid gap-3 d-md-flex justify-content-center mt-4">
                    <button
                      className="btn btn-outline-warning btn-lg px-4 py-2 fw-semibold"
                      onClick={handleGoBack}
                    >
                      <ArrowLeft size={20} className="me-2" />
                      Go Back
                    </button>
                    <button
                      className="btn btn-warning btn-lg px-4 py-2 text-white fw-semibold"
                      onClick={handleGoHome}
                    >
                      <Home size={20} className="me-2" />
                      Go Home
                    </button>
                  </div>

                  {/* Construction Notice */}
                  <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'rgba(255, 107, 53, 0.1)' }}>
                    <div className="d-flex align-items-center justify-content-center">
                      <HardHat size={18} className="text-warning me-2" />
                      <small className="text-warning fw-semibold">
                        Construction zone ahead! Please proceed with caution.
                      </small>
                    </div>
                  </div>

                </div>
              </div>

              {/* Footer Message */}
              <div className="text-center mt-4">
                <p className="text-muted small">
                  Thank you for your patience while we build something amazing for you! ✨
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Construction404;
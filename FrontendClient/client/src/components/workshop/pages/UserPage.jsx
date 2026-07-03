import React, { useState, useEffect, useContext } from "react";
import UserInfo from "../components/UserInfo";
import UserTable from "../components/UserTable";
import CourseTable from "../components/CourseTable";
import { AuthContext } from "../context/authContext";
import Table from "./Table";

export default function UserPage() {
  const { token } = useContext(AuthContext);

  return (
    <>
      <h1 className="flex  md:flex-column justify-center  text-4xl md:text-5xl font-bold text-eerie-black mb-20">
        Account information
      </h1>
      <div className="md:flex  md:flex-column justify-center  md:space-x-16 mb-16">
        <UserInfo />

        <CourseTable />
      </div>

      <div className="md:flex  md:justify-center">
        <UserTable />
      </div>

      <p className="italic flex justify-center mt-20">
        If your account information is incorrect, please contact the page
        manager.{" "}
      </p>
    </>
  );
}

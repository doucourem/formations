import React from "react";
import CompanyForm from "./Form";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Create() {
  return (
    <GuestLayout>
      <CompanyForm submitUrl="/companies" method="post" />
    </GuestLayout>
  );
}

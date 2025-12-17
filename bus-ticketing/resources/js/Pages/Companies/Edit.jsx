import React from "react";
import CompanyForm from "./Form";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Edit({ company }) {
  return (
    <GuestLayout>
      <CompanyForm
        company={company}
        submitUrl={`/companies/${company.id}`}
        method="put"
      />
    </GuestLayout>
  );
}

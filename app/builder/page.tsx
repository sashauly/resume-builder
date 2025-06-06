import { ResumeBuilder } from "@/components/resume-builder";
import { Suspense } from "react";

export default function BuilderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResumeBuilder />
    </Suspense>
  );
}

// In your grades/[id]/page.jsx
"use client";
import GradeRulesForm from '@/components/payroll/GradeRulesForm'

export default function GradeRulesPage({ params }) {
  // const gradeId = params.id
  const gradeId = 1

  const handleSuccess = (data) => {
    // console.log('Grade rules saved:', data)
    // Refresh or redirect
  }

  return (
    <div className="py-6">
      <GradeRulesForm
        initialData={{ grade_id: gradeId }}
        onSuccess={handleSuccess}
        onCancel={() => window.history.back()}
      />
    </div>
  )
}
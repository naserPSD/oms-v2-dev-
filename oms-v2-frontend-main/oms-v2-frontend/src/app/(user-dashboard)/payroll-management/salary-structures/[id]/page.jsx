// In your salary-structures/[id]/page.jsx
import SalaryStructureDetails from '@/components/payroll/SalaryStructureDetails'

export default function SalaryStructureDetailsPage({ params }) {
    return (
        <div>
            <SalaryStructureDetails structureId={params.id} />
        </div>
    )
}
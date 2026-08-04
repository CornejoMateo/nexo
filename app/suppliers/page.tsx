import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SuppliersManagement } from '@/components/business/suppliers/suppliers-management';

export default function SuppliersPage() {
	return (
		<DashboardLayout>
			<SuppliersManagement />
		</DashboardLayout>
	);
}

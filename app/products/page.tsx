import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProductsManagement } from '@/components/business/products/products-management';

export default function ProductsPage() {
	return <DashboardLayout>{<ProductsManagement />}</DashboardLayout>;
}

import OrderDetailView from "@/components/user/OrderDetailView";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="page-container">
      <OrderDetailView orderId={Number(id)} />
    </div>
  );
}

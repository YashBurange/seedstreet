import SeedStreetApp from "@/components/seedstreet-app";
export const instant = false;

export default async function Page({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return <SeedStreetApp view="profile" slug={slug} />; }

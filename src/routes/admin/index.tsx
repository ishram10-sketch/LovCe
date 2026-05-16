import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Camera, Mail, Package, Star, TrendingUp } from "lucide-react";
import { allPhotosQuery, packagesQuery, submissionsQuery, testimonialsQuery } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

function AdminDashboard() {
  const { data: photos = [] } = useQuery(allPhotosQuery());
  const { data: packages = [] } = useQuery(packagesQuery());
  const { data: submissions = [] } = useQuery(submissionsQuery());
  const { data: testimonials = [] } = useQuery(testimonialsQuery());

  const unread = submissions.filter((s) => !s.is_read).length;

  const stats = [
    {
      label: "Total Photos",
      value: photos.length,
      sub: `${photos.filter((p) => p.is_published).length} published`,
      icon: Camera,
      to: "/admin/photos",
    },
    {
      label: "Packages",
      value: packages.filter((p) => p.is_active).length,
      sub: `${packages.length} total`,
      icon: Package,
      to: "/admin/packages",
    },
    {
      label: "Submissions",
      value: submissions.length,
      sub: unread > 0 ? `${unread} unread` : "All read",
      icon: Mail,
      to: "/admin/submissions",
      alert: unread > 0,
    },
    {
      label: "Testimonials",
      value: testimonials.filter((t) => t.is_active).length,
      sub: `${testimonials.length} total`,
      icon: Star,
      to: "/admin/testimonials",
    },
  ];

  const categoryBreakdown = ["weddings", "portraits", "events"].map((cat) => ({
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
    count: photos.filter((p) => p.category === cat).length,
  }));

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1a1008]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#6b5a4a]">Overview of your photography site</p>
      </div>

      {unread > 0 && (
        <Link
          to="/admin/submissions"
          className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 hover:bg-amber-100 transition-colors"
        >
          <Mail className="h-4 w-4 flex-shrink-0" />
          <span>
            You have <strong>{unread}</strong> unread{" "}
            {unread === 1 ? "enquiry" : "enquiries"} — click to view
          </span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} to={stat.to}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-[rgba(26,16,8,0.08)]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-[#6b5a4a]">
                    {stat.label}
                  </CardTitle>
                  <Icon
                    className={`h-4 w-4 ${stat.alert ? "text-amber-500" : "text-[#C9A96E]"}`}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#1a1008]">{stat.value}</div>
                  <p
                    className={`mt-1 text-xs ${stat.alert ? "font-medium text-amber-600" : "text-[#8B6B3D]"}`}
                  >
                    {stat.sub}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Photo breakdown */}
        <Card className="border-[rgba(26,16,8,0.08)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-[#1a1008]">
              <TrendingUp className="h-4 w-4 text-[#C9A96E]" />
              Photos by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div key={cat.label} className="flex items-center gap-3">
                <span className="w-24 text-sm text-[#6b5a4a]">{cat.label}</span>
                <div className="flex-1 rounded-full bg-[#f0ede8] h-2">
                  <div
                    className="h-2 rounded-full bg-[#C9A96E]"
                    style={{
                      width: photos.length ? `${(cat.count / photos.length) * 100}%` : "0%",
                    }}
                  />
                </div>
                <span className="w-6 text-right text-sm font-medium text-[#1a1008]">
                  {cat.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent submissions */}
        <Card className="border-[rgba(26,16,8,0.08)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-[#1a1008]">
              <Mail className="h-4 w-4 text-[#C9A96E]" />
              Recent Enquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <p className="text-sm text-[#8B6B3D]">No enquiries yet.</p>
            ) : (
              <div className="space-y-3">
                {submissions.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-start gap-2">
                    <div
                      className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${s.is_read ? "bg-[#d0c9bf]" : "bg-[#C9A96E]"}`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#1a1008]">{s.name}</p>
                      <p className="truncate text-xs text-[#8B6B3D]">{s.project_type}</p>
                    </div>
                    <time className="ml-auto flex-shrink-0 text-xs text-[#8B6B3D]">
                      {new Date(s.created_at).toLocaleDateString()}
                    </time>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

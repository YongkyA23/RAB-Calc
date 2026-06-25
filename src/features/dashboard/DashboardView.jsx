import { ArrowRight, Boxes, Calculator, FileText, Layers, Plus, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TableSkeletonRows } from '../../components/ui/Table'
import { formatIdr } from '../../lib/format'

function StatCard({ icon: Icon, label, sub, value }) {
  return (
    <div className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">{value}</p>
      {sub ? <p className="mt-1 text-sm font-medium text-slate-500">{sub}</p> : null}
    </div>
  )
}

function QuickAction({ icon: Icon, label, sub, to }) {
  return (
    <Link
      className="group flex items-center gap-4 rounded-3xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-blue-200 hover:bg-blue-50"
      to={to}
    >
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm">
        <Icon size={20} />
      </span>
      <div className="flex-1">
        <p className="text-sm font-black text-slate-900">{label}</p>
        <p className="text-xs font-medium text-slate-500">{sub}</p>
      </div>
      <ArrowRight className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" size={18} />
    </Link>
  )
}

export function DashboardView({ activity, loading, profile, stats }) {
  return (
    <div className="space-y-6">
      <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Dashboard</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
          Selamat datang{profile?.name ? `, ${profile.name}` : ''}
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-500">Ringkasan estimasi harga dan vendor quote Anda.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Calculator} label="Total Estimasi" sub={`${stats.draftCount} draf / ${stats.createdCount} dibuat`} value={stats.estimateCount} />
        <StatCard icon={Wallet} label="Total Nilai Estimasi" value={formatIdr(stats.estimateValue)} />
        <StatCard icon={FileText} label="Estimasi Vendor" sub="Quote tersimpan" value={stats.vendorCount} />
        <StatCard icon={Boxes} label="Total Nilai Vendor" value={formatIdr(stats.vendorValue)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="overflow-hidden rounded-4xl border border-white/80 bg-white shadow-xl shadow-slate-300/40">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <Layers size={20} />
            </span>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-950">Aktivitas terbaru</h3>
              <p className="text-sm font-medium text-slate-500">Estimasi dan quote vendor yang terakhir diperbarui.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Tipe</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Nama</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Nilai</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <TableSkeletonRows columns={4} />
                ) : activity.length === 0 ? (
                  <tr>
                    <td className="px-4 py-12 text-center text-sm font-medium text-slate-500" colSpan={4}>
                      Belum ada aktivitas.
                    </td>
                  </tr>
                ) : activity.map((item) => (
                  <tr className="transition hover:bg-blue-50/30" key={`${item.type}-${item.id}`}>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${item.type === 'estimate' ? 'bg-blue-50 text-blue-700 ring-blue-200' : 'bg-violet-50 text-violet-700 ring-violet-200'}`}>
                        {item.type === 'estimate' ? 'Estimasi' : 'Vendor'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link className="font-semibold text-slate-900 hover:text-blue-600 hover:underline" to={item.to}>{item.label}</Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatIdr(item.value)}</td>
                    <td className="px-4 py-3 text-slate-600">{item.date ? new Date(item.date).toLocaleDateString('id-ID') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
          <h3 className="text-lg font-black tracking-tight text-slate-950">Aksi cepat</h3>
          <div className="mt-4 space-y-3">
            <QuickAction icon={Plus} label="Estimasi baru" sub="Buat estimasi harga" to="/estimates/new" />
            <QuickAction icon={Plus} label="Estimasi vendor baru" sub="Simpan quote vendor" to="/vendor-estimates/new" />
            <QuickAction icon={Calculator} label="Lihat semua estimasi" sub="Buka papan estimasi" to="/estimates" />
            <QuickAction icon={FileText} label="Lihat estimasi vendor" sub="Buka papan vendor" to="/vendor-estimates" />
          </div>
        </section>
      </div>
    </div>
  )
}

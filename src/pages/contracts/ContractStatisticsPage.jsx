import { useState, useEffect } from 'react';
import { fetchContractStatistics, createContractStatisticsSnapshot, fetchContractStatisticsHistory } from '../../api/contractExtras';

function StatCard({ icon, label, value, cls }) {
  return (
    <div className={`card p-6 flex items-center gap-4 ${cls ?? ''}`}>
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
      </div>
      <div>
        <p className="text-xs text-on-surface-variant">{label}</p>
        <p className="text-2xl font-bold text-on-surface mt-0.5">{value?.toLocaleString('ko-KR') ?? '—'}</p>
      </div>
    </div>
  );
}

export default function ContractStatisticsPage() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snapshotting, setSnapshotting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, h] = await Promise.all([
        fetchContractStatistics(),
        fetchContractStatisticsHistory({ size: 5 }),
      ]);
      setStats(s);
      setHistory(h.items ?? []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSnapshot = async () => {
    setSnapshotting(true);
    try { await createContractStatisticsSnapshot(); await load(); }
    catch { } finally { setSnapshotting(false); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">계약 통계</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {stats?.createdAt ? `기준: ${new Date(stats.createdAt).toLocaleString('ko-KR')}` : '최근 스냅샷'}
          </p>
        </div>
        <button onClick={handleSnapshot} disabled={snapshotting} className="btn-primary flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          {snapshotting ? '집계 중...' : '스냅샷 생성'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="description"  label="전체 계약"  value={stats.totalCount} />
            <StatCard icon="check_circle" label="정상 계약"  value={stats.activeCount} />
            <StatCard icon="event"        label="만기 계약"  value={stats.expiredCount} />
            <StatCard icon="cancel"       label="해지 계약"  value={stats.cancelledCount} />
          </div>

          {/* 비율 바 */}
          <div className="card p-6 space-y-3">
            <h2 className="font-semibold text-on-surface text-sm">계약 상태 분포</h2>
            {stats.totalCount > 0 && (() => {
              const bars = [
                { label: '정상', count: stats.activeCount, cls: 'bg-primary' },
                { label: '만기', count: stats.expiredCount, cls: 'bg-outline-variant' },
                { label: '해지', count: stats.cancelledCount, cls: 'bg-error' },
              ];
              return bars.map(({ label, count, cls }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>{label}</span>
                    <span>{((count / stats.totalCount) * 100).toFixed(1)}% ({count?.toLocaleString()}건)</span>
                  </div>
                  <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full ${cls} rounded-full transition-all`} style={{ width: `${(count / stats.totalCount) * 100}%` }} />
                  </div>
                </div>
              ));
            })()}
          </div>
        </>
      ) : (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl text-outline">bar_chart</span>
          <p className="text-sm">스냅샷을 생성해주세요.</p>
        </div>
      )}

      {/* 이력 */}
      {history.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-outline-variant/50 bg-surface-container-low">
            <h3 className="font-semibold text-sm text-on-surface">통계 이력</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/50">
                {['번호', '전체', '정상', '만기', '해지', '생성일'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(s => (
                <tr key={s.statsNo} className="border-b border-outline-variant/30 hover:bg-surface-container-low">
                  <td className="px-4 py-2.5 font-mono text-xs text-outline">{s.statsNo}</td>
                  <td className="px-4 py-2.5">{s.totalCount?.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-primary">{s.activeCount?.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-on-surface-variant">{s.expiredCount?.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-error">{s.cancelledCount?.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-xs text-on-surface-variant">{new Date(s.createdAt).toLocaleString('ko-KR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

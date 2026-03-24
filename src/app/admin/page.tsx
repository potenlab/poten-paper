'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  RefreshCw,
  ScrollText,
  CheckCircle2,
  Clock,
  CalendarPlus,
  AlertCircle,
  Trash2,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import {
  usePotenPaperAdminStats,
  usePotenPaperAdminList,
  useDeleteBusinessPlan,
} from '@/lib/admin/use-poten-paper-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const BRAND_COLOR = '#0EA5E9';

// Admin user IDs or emails allowed to access this page
const ADMIN_EMAILS = [process.env.NEXT_PUBLIC_ADMIN_EMAIL];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Check admin access
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login?next=/admin');
      return;
    }

    async function checkAdminRole() {
      // Check by email
      if (ADMIN_EMAILS.includes(user!.email ?? '')) {
        setIsAdmin(true);
        setCheckingAdmin(false);
        return;
      }

      // Check by profile role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, username')
        .eq('id', user!.id)
        .single();

      if (profile?.role === 'admin' || profile?.username === 'minssum') {
        setIsAdmin(true);
      } else {
        router.replace('/poten-paper');
        toast.error('접근 권한이 없습니다.');
      }
      setCheckingAdmin(false);
    }

    checkAdminRole();
  }, [user, authLoading, router]);

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = usePotenPaperAdminStats();
  const {
    data: plans,
    isLoading: listLoading,
    error: listError,
    refetch: refetchList,
  } = usePotenPaperAdminList(debouncedSearch);
  const deleteMutation = useDeleteBusinessPlan();

  const handleRefresh = async () => {
    await Promise.all([refetchStats(), refetchList()]);
    toast.success('새로고침 완료');
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteMutation.mutateAsync(deleteTargetId);
      toast.success('삭제되었습니다.');
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/poten-paper');
  };

  if (authLoading || checkingAdmin || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1156px] mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScrollText className="w-6 h-6" style={{ color: BRAND_COLOR }} />
          <h1 className="text-2xl font-bold text-foreground">포텐페이퍼 관리</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            새로고침
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 animate-pulse">
              <div className="h-4 w-24 bg-card-secondary rounded mb-2" />
              <div className="h-8 w-16 bg-card-secondary rounded" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              icon={<ScrollText className="h-4 w-4" style={{ color: BRAND_COLOR }} />}
              iconBg={`${BRAND_COLOR}15`}
              label="전체"
              value={stats?.total ?? 0}
            />
            <StatCard
              icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
              iconBg="rgb(34 197 94 / 0.1)"
              label="완료"
              value={stats?.completedCount ?? 0}
            />
            <StatCard
              icon={<Clock className="h-4 w-4 text-yellow-500" />}
              iconBg="rgb(234 179 8 / 0.1)"
              label="진행 중"
              value={stats?.inProgressCount ?? 0}
            />
            <StatCard
              icon={<CalendarPlus className="h-4 w-4 text-blue-500" />}
              iconBg="rgb(59 130 246 / 0.1)"
              label="오늘"
              value={stats?.todayCount ?? 0}
            />
          </>
        )}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          placeholder="사업계획서 제목 검색..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Plan List */}
      {listLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 animate-pulse">
              <div className="h-4 w-40 bg-card-secondary rounded mb-2" />
              <div className="h-3 w-56 bg-card-secondary rounded" />
            </div>
          ))}
        </div>
      ) : listError ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <AlertCircle className="h-8 w-8 text-muted mx-auto mb-3" />
          <p className="text-muted mb-3">데이터를 불러오는데 실패했습니다.</p>
          <Button variant="outline" size="sm" onClick={() => refetchList()}>
            다시 시도
          </Button>
        </div>
      ) : plans && plans.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <ScrollText className="h-8 w-8 text-muted mx-auto mb-3" />
          <p className="font-medium text-foreground">결과가 없습니다</p>
          <p className="text-sm text-muted mt-1">검색 조건에 맞는 사업계획서가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans?.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-card-hover"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground truncate">{item.title}</p>
                    <Badge
                      variant="outline"
                      className={
                        item.status === 'completed'
                          ? 'bg-green-50 text-green-600 border-green-200 text-xs'
                          : 'bg-yellow-50 text-yellow-600 border-yellow-200 text-xs'
                      }
                    >
                      {item.status === 'completed' ? '완료' : '진행 중'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>{item.user_name || item.user_email || 'Unknown'}</span>
                    {item.industry && <span>{item.industry}</span>}
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/poten-paper/${item.id}`, '_blank')}
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-error hover:text-error hover:bg-error/10"
                    onClick={() => {
                      setDeleteTargetId(item.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>삭제</DialogTitle>
            <DialogDescription>이 사업계획서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
        <span className="text-xs text-muted font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

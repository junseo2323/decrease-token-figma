import {
  LayoutGrid,
  ShoppingBag,
  Star,
  Inbox,
  ClipboardList,
  Package,
  Tag,
  Calendar,
  SquareCheckBig,
  Contact,
  FileText,
  LayoutPanelLeft,
  Users,
  Table,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import profileAvatar from './assets/Dashboard_profileAvatar.png';
import revenueChart from './assets/Dashboard_revenueChart.png';
import customersDonut from './assets/Dashboard_customersDonut.png';
import salesAnalyticsChart from './assets/Dashboard_salesAnalyticsChart.png';

const WHITE = '#ffffff';

/** 좌측 사이드바 메뉴 (DashStack) */
const sidebarMain = [
  { label: 'Dashboard', icon: LayoutGrid, active: true },
  { label: 'Products', icon: ShoppingBag },
  { label: 'Favorites', icon: Star },
  { label: 'Inbox', icon: Inbox },
  { label: 'Order Lists', icon: ClipboardList },
  { label: 'Product Stock', icon: Package },
];

const sidebarPages = [
  { label: 'Pricing', icon: Tag },
  { label: 'Calender', icon: Calendar },
  { label: 'To-Do', icon: SquareCheckBig },
  { label: 'Contact', icon: Contact },
  { label: 'Invoice', icon: FileText },
  { label: 'UI Elements', icon: LayoutPanelLeft },
  { label: 'Team', icon: Users },
  { label: 'Table', icon: Table },
];

const sidebarBottom = [
  { label: 'Settings', icon: Settings },
  { label: 'Logout', icon: LogOut },
];

function SidebarItem({ label, icon: Icon, active }: { label: string; icon: typeof Inbox; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-[12px] mx-[10px] px-[12px] h-[36px] rounded-[6px] ${
        active ? 'bg-[#4880ff]' : ''
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" style={{ color: active ? WHITE : '#202224' }} strokeWidth={2} />
      <span
        className="whitespace-nowrap text-[14px] font-semibold tracking-[0.3px]"
        style={{ color: active ? WHITE : '#202224' }}
      >
        {label}
      </span>
    </div>
  );
}

export function DashboardScreen() {
  return (
    <div className="flex h-[761px] w-[1024px] bg-[#f5f6fa] text-[#202224] font-sans overflow-hidden">
      {/* ===== Sidebar ===== */}
      <aside className="flex w-[170px] flex-col bg-[#ffffff] py-[20px]">
        <div className="px-[24px] pb-[16px] text-[20px] font-extrabold tracking-tight">
          <span className="text-[#4880ff]">Dash</span>
          <span className="text-[#202224]">Stack</span>
        </div>

        <nav className="flex flex-col gap-[2px]">
          {sidebarMain.map((it) => (
            <SidebarItem key={it.label} {...it} />
          ))}
        </nav>

        <div className="mx-[14px] my-[10px] h-px bg-[#e0e0e0]" />
        <p className="px-[24px] pb-[6px] text-[12px] font-bold tracking-[0.26px] text-[#202224] opacity-60">
          PAGES
        </p>
        <nav className="flex flex-col gap-[2px]">
          {sidebarPages.map((it) => (
            <SidebarItem key={it.label} {...it} />
          ))}
        </nav>

        <div className="mx-[14px] my-[10px] h-px bg-[#e0e0e0]" />
        <nav className="flex flex-col gap-[2px]">
          {sidebarBottom.map((it) => (
            <SidebarItem key={it.label} {...it} />
          ))}
        </nav>
      </aside>

      {/* ===== Right area ===== */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-[50px] items-center bg-[#ffffff] px-[24px]">
          <Menu className="h-[22px] w-[22px] text-[#202224] opacity-90" />
          <div className="ml-[24px] flex h-[36px] w-[388px] items-center gap-[10px] rounded-[19px] border-[0.6px] border-[#d5d5d5] bg-[#f5f6fa] px-[16px]">
            <Search className="h-[16px] w-[16px] text-[#202224] opacity-50" />
            <span className="text-[14px] text-[#202224] opacity-50">Search</span>
          </div>

          <div className="ml-auto flex items-center gap-[24px]">
            {/* Notification */}
            <div className="relative">
              <Bell className="h-[22px] w-[22px] text-[#4880ff]" />
              <span className="absolute -right-[6px] -top-[6px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#f93c65] text-[10px] font-bold text-[#ffffff]">
                6
              </span>
            </div>

            {/* Language */}
            <div className="flex items-center gap-[8px]">
              <span className="text-[18px] leading-none">🇬🇧</span>
              <span className="text-[14px] font-semibold text-[#646464]">English</span>
              <ChevronDown className="h-[16px] w-[16px] text-[#646464]" />
            </div>

            {/* Profile */}
            <div className="flex items-center gap-[10px]">
              <img src={profileAvatar} alt="Moni Roy" className="h-[34px] w-[34px] rounded-full object-cover" />
              <div className="leading-tight">
                <p className="text-[14px] font-bold text-[#404040]">Moni Roy</p>
                <p className="text-[12px] font-semibold text-[#565656]">Admin</p>
              </div>
              <ChevronDown className="h-[16px] w-[16px] text-[#202224]" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="min-w-0 flex-1 overflow-hidden px-[24px] pt-[18px] text-left">
          <h1 className="mb-[12px] text-[32px] font-bold tracking-tight text-[#202224]">Dashboard</h1>

          {/* ----- Revenue card ----- */}
          <section className="rounded-[14px] bg-[#ffffff] p-[20px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]">
            <div className="mb-[8px] flex items-center justify-between">
              <h2 className="text-[24px] font-bold text-[#202224]">Revenue</h2>
              <button className="flex h-[30px] items-center gap-[8px] rounded-[4px] border-[0.6px] border-[#d5d5d5] bg-[#fcfdfd] px-[12px] text-[12px] text-[rgba(43,48,52,0.6)]">
                October
                <ChevronDown className="h-[14px] w-[14px]" />
              </button>
            </div>
            <img src={revenueChart} alt="Revenue chart" className="w-full" />
            <div className="mt-[12px] flex items-center justify-center gap-[40px]">
              <div className="flex items-center gap-[8px]">
                <span className="h-[10px] w-[10px] rounded-full bg-[#fb8b6d]" />
                <span className="text-[14px] font-semibold text-[#282d32]">Sales</span>
              </div>
              <div className="flex items-center gap-[8px]">
                <span className="h-[10px] w-[10px] rounded-full bg-[#c89cf6]" />
                <span className="text-[14px] font-semibold text-[#282d32]">Profit</span>
              </div>
            </div>
          </section>

          {/* ----- Bottom row: 3 cards ----- */}
          <div className="mt-[16px] grid grid-cols-3 gap-[24px]">
            {/* Customers */}
            <section className="flex flex-col rounded-[14px] bg-[#ffffff] p-[20px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]">
              <h2 className="text-[22px] font-bold text-[#202224]">Customers</h2>
              <div className="flex flex-1 items-center justify-center py-[6px]">
                <img src={customersDonut} alt="Customers chart" className="h-[104px] w-[104px]" />
              </div>
              <div className="flex items-start justify-between px-[8px]">
                <div className="flex flex-col items-center gap-[4px]">
                  <span className="text-[28px] font-bold tracking-[1px] text-[#202224]">34,249</span>
                  <span className="flex items-center gap-[6px] whitespace-nowrap text-[15px] font-semibold text-[#282d32] opacity-80">
                    <span className="h-[8px] w-[8px] rounded-full bg-[#4880ff]" />
                    New Customers
                  </span>
                </div>
                <div className="flex flex-col items-center gap-[4px]">
                  <span className="text-[28px] font-bold tracking-[1px] text-[#202224]">1420</span>
                  <span className="flex items-center gap-[6px] whitespace-nowrap text-[15px] font-semibold text-[#282d32] opacity-80">
                    <span className="h-[8px] w-[8px] rounded-full bg-[#a9c5ff]" />
                    Repeated
                  </span>
                </div>
              </div>
            </section>

            {/* Featured Product */}
            <section className="flex flex-col rounded-[14px] bg-[#ffffff] p-[24px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]">
              <h2 className="text-[22px] font-bold text-[#202224]">Featured Product</h2>
              <div className="flex flex-1 items-center justify-between py-[8px]">
                <button className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-[#202224] opacity-40">
                  <ChevronLeft className="h-[24px] w-[24px]" />
                </button>
                <div className="flex-1" />
                <button className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-[#202224] opacity-40">
                  <ChevronRight className="h-[24px] w-[24px]" />
                </button>
              </div>
              <div className="flex flex-col items-center gap-[4px]">
                <span className="text-[18px] font-bold text-[#282d32]">Beats Headphone 2026</span>
                <span className="text-[16px] font-bold text-[#4880ff] opacity-70">$89.00</span>
              </div>
            </section>

            {/* Sales Analytics */}
            <section className="flex flex-col rounded-[14px] bg-[#ffffff] p-[24px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]">
              <h2 className="mb-[8px] text-[22px] font-bold text-[#202224]">Sales Analytics</h2>
              <div className="flex flex-1 items-center justify-center">
                <img src={salesAnalyticsChart} alt="Sales analytics chart" className="max-h-[150px] w-full object-contain" />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardScreen;

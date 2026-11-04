"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "../../../sidebar";

type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  tier: "Admin" | "ผู้จัดการ" | "พนักงาน";
  used: number;
  limit: number;
};

type HistoryEntry = {
  id: string;
  changedAt: string;
  summary: string;
};

type BenefitRecord = {
  id: string;
  requestNumber: string;
  documentNumber: string;
  date: string;
  benefit: string;
  activity: string;
  actor: string;
  amount: number;
};

const sampleRecords: Record<string, BenefitRecord[]> = {
  "0124": [
    { id: "0124-1", requestNumber: "REQ-2026-00124", documentNumber: "DOC-2026-00124", date: "2026-10-12T14:00:00", benefit: "ทันตกรรม", activity: "อนุมัติคำขอเบิก ทันตกรรม 900 บาท", actor: "HR_Name01", amount: 900 },
    { id: "0124-2", requestNumber: "REQ-2026-00068", documentNumber: "DOC-2026-00068", date: "2026-06-01T09:30:00", benefit: "ค่ารักษาพยาบาล", activity: "อนุมัติคำขอเบิก ค่ารักษาพยาบาล 2,000 บาท", actor: "HR_Name01", amount: 2000 },
  ],
  "0352": [
    { id: "0352-1", requestNumber: "REQ-2026-00121", documentNumber: "DOC-2026-00121", date: "2026-10-12T11:15:00", benefit: "ค่ารักษาพยาบาล", activity: "อนุมัติคำขอเบิก ค่ารักษาพยาบาล 2,000 บาท", actor: "HR_Name01", amount: 2000 },
  ],
  "0411": [
    { id: "0411-1", requestNumber: "REQ-2026-00119", documentNumber: "DOC-2026-00119", date: "2026-10-11T15:40:00", benefit: "ฟิตเนสรายปี", activity: "อนุมัติคำขอเบิก ฟิตเนสรายปี 5,000 บาท", actor: "HR_Name02", amount: 5000 },
  ],
};

function isEmployee(value: unknown): value is Employee {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value && typeof value.id === "string" &&
    "name" in value && typeof value.name === "string" &&
    "email" in value && typeof value.email === "string" &&
    "department" in value && typeof value.department === "string" &&
    "position" in value && typeof value.position === "string" &&
    "tier" in value && (value.tier === "Admin" || value.tier === "ผู้จัดการ" || value.tier === "พนักงาน") &&
    "used" in value && typeof value.used === "number" &&
    "limit" in value && typeof value.limit === "number"
  );
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value && typeof value.id === "string" &&
    "changedAt" in value && typeof value.changedAt === "string" &&
    "summary" in value && typeof value.summary === "string"
  );
}

function isEmployeeRecordMap(value: unknown): value is Record<string, Employee> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.entries(value).every(([id, employee]) => isEmployee(employee) && id === employee.id)
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH").format(value);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const time = new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);
  return `${day}/${month}/${year} ${time}`;
}

export default function EmployeeHistoryPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [expenseHistory, setExpenseHistory] = useState<BenefitRecord[]>([]);
  const [auditHistory, setAuditHistory] = useState<HistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"expenses" | "audit">("expenses");
  const [benefitFilter, setBenefitFilter] = useState("ทั้งหมด");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const routeEmployeeId = decodeURIComponent(pathParts[1] ?? "");
        setEmployeeId(routeEmployeeId);
        const selectedEmployee: unknown = JSON.parse(sessionStorage.getItem("viewing-employee") ?? "null");
        if (!isEmployee(selectedEmployee) || selectedEmployee.id !== routeEmployeeId) {
          setLoadError("ไม่พบข้อมูลพนักงาน กรุณากลับไปเลือกรายชื่อจากหน้าจัดการพนักงาน");
          return;
        }

        const savedOverrides = sessionStorage.getItem("employee-overrides");
        const parsedOverrides: unknown = savedOverrides ? JSON.parse(savedOverrides) : {};
        if (!isEmployeeRecordMap(parsedOverrides)) {
          setLoadError("ข้อมูลพนักงานที่แก้ไขไว้ไม่ถูกต้อง");
          return;
        }
        const currentEmployee = parsedOverrides[routeEmployeeId] ?? selectedEmployee;
        setEmployee(currentEmployee);

        const savedHistory = sessionStorage.getItem(`employee-history-${routeEmployeeId}`);
        const parsedHistory: unknown = savedHistory ? JSON.parse(savedHistory) : [];
        if (!Array.isArray(parsedHistory) || !parsedHistory.every(isHistoryEntry)) {
          setLoadError("ข้อมูลประวัติพนักงานไม่ถูกต้อง");
          return;
        }
        setAuditHistory(parsedHistory);
        setExpenseHistory(sampleRecords[routeEmployeeId] ?? (currentEmployee.used > 0 ? [{
          id: `${routeEmployeeId}-sample`,
          requestNumber: `REQ-2026-${routeEmployeeId}`,
          documentNumber: `DOC-2026-${routeEmployeeId}`,
          date: "2026-10-12T14:00:00",
          benefit: "สวัสดิการอื่น ๆ",
          activity: `อนุมัติคำขอเบิกสวัสดิการ ${formatCurrency(currentEmployee.used)} บาท`,
          actor: "HR_Name01",
          amount: currentEmployee.used,
        }] : []));
      } catch {
        setLoadError("ไม่สามารถโหลดประวัติพนักงานได้");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const benefitTypes = useMemo(
    () => [...new Set(expenseHistory.map((entry) => entry.benefit))],
    [expenseHistory],
  );
  const filteredHistory = useMemo(
    () => expenseHistory.filter((entry) =>
      (benefitFilter === "ทั้งหมด" || entry.benefit === benefitFilter) &&
      (!startDateTime || new Date(entry.date).getTime() >= new Date(startDateTime).getTime()) &&
      (!endDateTime || new Date(entry.date).getTime() <= new Date(endDateTime).getTime() + 59_999),
    ),
    [benefitFilter, endDateTime, expenseHistory, startDateTime],
  );
  const monthlyTotal = employee?.used ?? 0;

  return (
    <div className={`app-shell${collapsed ? " sidebar-collapsed" : ""}`}>
      <Sidebar
        activeId="employees"
        notificationCount={12}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        onCloseMobile={() => setMobileOpen(false)}
        onNavigate={() => setMobileOpen(false)}
      />
      <main className="app-main employee-history-main">
        <header className="topbar employee-management-topbar">
          <button type="button" className="mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="เปิดเมนู">
            <span /><span /><span />
          </button>
          <div className="topbar-search">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>
            <input aria-label="ค้นหา" placeholder="ค้นหา..." />
            <kbd>⌘ K</kbd>
          </div>
          <div className="topbar-actions">
            <span className="avatar">HR</span>
            <span className="user-details"><strong>ผู้ดูแลระบบ</strong><small>Admin</small></span>
          </div>
        </header>

        <div className="page-content employee-history-content">
          <nav className="breadcrumbs" aria-label="เส้นทางนำทาง">
            <Link href="/employees">จัดการพนักงานและสิทธิ์</Link>
            <span className="breadcrumb-separator" aria-hidden="true">&gt;</span>
            <span aria-current="page">ดูประวัติ</span>
          </nav>
          <h1 className="employee-history-title">
            {employee ? `${employee.name} (รหัส ${employee.id})` : `ประวัติพนักงาน ${employeeId}`}
          </h1>
          <p className="employee-history-subtitle">ประวัติสวัสดิการพนักงาน</p>

          {loadError ? (
            <div className="employee-history-load-error" role="alert">
              <p>{loadError}</p>
              <Link href="/employees" className="button button-secondary">กลับหน้าจัดการพนักงาน</Link>
            </div>
          ) : employee ? (
            <>
              <section className="employee-history-summary" aria-labelledby="employee-history-summary-title">
                <h2 id="employee-history-summary-title">สรุปสถานะปัจจุบันของ {employee.name.replace(/^(นาย|นาง|นางสาว|น\.ส\.)/, "")}</h2>
                <div className="employee-history-profile">
                  <label>
                    <span>ชื่อพนักงาน:</span>
                    <strong>{employee.name}</strong>
                  </label>
                  <label>
                    <span>แผนก:</span>
                    <strong>{employee.department}</strong>
                  </label>
                  <label>
                    <span>ตำแหน่งปัจจุบัน:</span>
                    <strong>{employee.position}</strong>
                  </label>
                </div>
                <div className="employee-history-totals">
                  <div>
                    <span>ยอดเบิกสะสมเดือนนี้</span>
                    <strong>{formatCurrency(monthlyTotal)} <small>บาท</small></strong>
                  </div>
                  <div>
                    <span>โควต้าคงเหลือรวม</span>
                    <strong>{formatCurrency(Math.max(employee.limit - employee.used, 0))} <small>บาท</small></strong>
                  </div>
                </div>
              </section>

              <section className="employee-history-records" aria-label="รายละเอียดประวัติพนักงาน">
                <div className="employee-history-tabs" role="tablist" aria-label="ประเภทประวัติ">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "expenses"}
                    className={activeTab === "expenses" ? "active" : ""}
                    onClick={() => setActiveTab("expenses")}
                  >ประวัติการเบิกจ่ายสวัสดิการ</button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "audit"}
                    className={activeTab === "audit" ? "active" : ""}
                    onClick={() => setActiveTab("audit")}
                  >ประวัติการแก้ไขสิทธิ์ (Audit Log)</button>
                </div>

                {activeTab === "expenses" ? (
                  <>
                    <div className="employee-history-controls">
                      <label>
                        <span>ประเภทสวัสดิการ:</span>
                        <select value={benefitFilter} onChange={(event) => setBenefitFilter(event.target.value)} aria-label="กรองประเภทสวัสดิการ">
                          <option>ทั้งหมด</option>
                          {benefitTypes.map((type) => <option key={type}>{type}</option>)}
                        </select>
                      </label>
                      <div className="employee-history-date-filter">
                        <label>
                          <span>วันที่/เวลาตั้งแต่:</span>
                          <input type="datetime-local" value={startDateTime} max={endDateTime || undefined} onChange={(event) => setStartDateTime(event.target.value)} aria-label="วันที่และเวลาเริ่มต้น" />
                        </label>
                        <label>
                          <span>ถึง:</span>
                          <input type="datetime-local" value={endDateTime} min={startDateTime || undefined} onChange={(event) => setEndDateTime(event.target.value)} aria-label="วันที่และเวลาสิ้นสุด" />
                        </label>
                        {(startDateTime || endDateTime) ? (
                          <button type="button" className="employee-history-clear-date" onClick={() => { setStartDateTime(""); setEndDateTime(""); }}>ล้างวันที่</button>
                        ) : null}
                      </div>
                      <span className="employee-history-result-count">{filteredHistory.length} รายการ</span>
                    </div>
                    <div className="employee-history-table-wrap">
                      <table className="employee-history-table employee-history-expense-table">
                        <thead>
                          <tr><th scope="col">เลขที่คำขอ</th><th scope="col">เลขที่เอกสาร</th><th scope="col">วันที่-เวลา</th><th scope="col">รายการกิจกรรม</th><th scope="col">ผู้ดำเนินการ</th></tr>
                        </thead>
                        <tbody>
                          {filteredHistory.map((entry) => (
                            <tr key={entry.id}>
                              <td><span>เลขที่คำขอ</span><strong>{entry.requestNumber}</strong></td>
                              <td><span>เลขที่เอกสาร</span><strong>{entry.documentNumber}</strong></td>
                              <td><span>วันที่-เวลา</span><time dateTime={entry.date}>{formatDateTime(entry.date)}</time></td>
                              <td><span>รายการกิจกรรม</span><strong>{entry.activity}</strong></td>
                              <td><span>ผู้ดำเนินการ</span><strong>{entry.actor}</strong></td>
                            </tr>
                          ))}
                          {!filteredHistory.length ? <tr><td className="employee-history-no-records" colSpan={5}>ไม่พบประวัติการเบิกจ่ายสวัสดิการ</td></tr> : null}
                        </tbody>
                      </table>
                    </div>
                    <p className="employee-history-count">แสดงผล {filteredHistory.length ? `1-${filteredHistory.length} จาก ` : ""}{filteredHistory.length} รายการ</p>
                  </>
                ) : (
                  <>
                    <div className="employee-history-controls"><span>{auditHistory.length} รายการ</span></div>
                    <div className="employee-history-table-wrap">
                      <table className="employee-history-table">
                        <thead>
                          <tr><th scope="col">วันที่-เวลา</th><th scope="col">รายการกิจกรรม</th><th scope="col">ผู้ดำเนินการ</th></tr>
                        </thead>
                        <tbody>
                          {auditHistory.map((entry) => (
                            <tr key={entry.id}>
                              <td><span>วันที่-เวลา</span><time dateTime={entry.changedAt}>{formatDateTime(entry.changedAt)}</time></td>
                              <td><span>รายการกิจกรรม</span><strong>{entry.summary}</strong></td>
                              <td><span>ผู้ดำเนินการ</span><strong>ผู้ดูแลระบบ</strong></td>
                            </tr>
                          ))}
                          {!auditHistory.length ? <tr><td className="employee-history-no-records" colSpan={3}>ยังไม่มีประวัติการแก้ไขสิทธิ์</td></tr> : null}
                        </tbody>
                      </table>
                    </div>
                    <p className="employee-history-count">แสดงผล {auditHistory.length ? `1-${auditHistory.length} จาก ` : ""}{auditHistory.length} รายการ</p>
                  </>
                )}
              </section>

              <div className="employee-history-footer">
                <Link href="/employees" className="button button-secondary">← กลับหน้าหลัก</Link>
                <button type="button" className="button button-primary" onClick={() => window.print()}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z" /></svg>
                  พิมพ์รายงานพนักงาน
                </button>
              </div>
            </>
          ) : <p className="employee-history-loading">กำลังโหลดประวัติพนักงาน...</p>}
        </div>
      </main>
    </div>
  );
}

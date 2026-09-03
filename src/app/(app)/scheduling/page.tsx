"use client";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import type { RepairOrder } from "@/features/repair-orders/repair-order.types";

import { CancelServiceAppointmentDialog } from "@/features/scheduling/components/CancelServiceAppointmentDialog";

import { CreateServiceAppointmentDialog } from "@/features/scheduling/components/CreateServiceAppointmentDialog";

import { DispatchBoard } from "@/features/scheduling/components/DispatchBoard";

import { ScheduleRepairOrderDialog } from "@/features/scheduling/components/ScheduleRepairOrderDialog";

import { SchedulingHeader } from "@/features/scheduling/components/SchedulingHeader";

import { SchedulingMetrics } from "@/features/scheduling/components/SchedulingMetrics";

import {
  isSchedulingTab,
  SchedulingTabs,
  type SchedulingTab,
} from "@/features/scheduling/components/SchedulingTabs";

import { ServiceAppointmentsPanel } from "@/features/scheduling/components/ServiceAppointmentsPanel";

import { UnscheduledWorkPanel } from "@/features/scheduling/components/UnscheduledWorkPanel";

import { WorkBlockDetailDialog } from "@/features/scheduling/components/WorkBlockDetailDialog";

import type {
  ScheduleWorkBlock,
  ServiceAppointment,
  ServiceAppointmentStatus,
} from "@/features/scheduling/scheduling.types";

import {
  addDays,
  getAppointmentsCount,
  getDateFromScheduleParam,
  getScheduledRepairOrderCount,
  getSchedulingDayRange,
  getShopCapacityPercent,
  startOfLocalDay,
  toScheduleDateParam,
} from "@/features/scheduling/scheduling.utils";

import {
  useCancelServiceAppointmentMutation,
  useCheckInServiceAppointmentMutation,
  useConfirmServiceAppointmentMutation,
  useConvertServiceAppointmentToRepairOrderMutation,
  useGetSchedulingBoardQuery,
  useGetServiceAppointmentsQuery,
} from "@/store/api/schedulingApi";

import { useAppSelector } from "@/store/hooks";

import { selectActiveOrganizationId } from "@/store/slices/workspaceSlice";

//************************************************************** */

export default function SchedulingPage() {
  const organizationId = useAppSelector(selectActiveOrganizationId);

  const router = useRouter();

  const searchParams = useSearchParams();

  //************************************************************** */
  // Dispatch State

  const [selectedWorkBlock, setSelectedWorkBlock] =
    useState<ScheduleWorkBlock | null>(null);

  const [schedulingRepairOrder, setSchedulingRepairOrder] =
    useState<RepairOrder | null>(null);

  const [reschedulingWorkBlock, setReschedulingWorkBlock] =
    useState<ScheduleWorkBlock | null>(null);

  //************************************************************** */
  // Appointment State

  const [appointmentSearch, setAppointmentSearch] = useState("");

  const [appointmentStatus, setAppointmentStatus] = useState<
    ServiceAppointmentStatus | ""
  >("");

  const [creatingAppointment, setCreatingAppointment] = useState(false);

  const [cancellingAppointment, setCancellingAppointment] =
    useState<ServiceAppointment | null>(null);

  const [busyAppointmentId, setBusyAppointmentId] = useState<string | null>(
    null,
  );

  const [appointmentError, setAppointmentError] = useState<string | null>(null);

  //************************************************************** */

  const selectedDate = getDateFromScheduleParam(searchParams.get("date"));

  const queryTab = searchParams.get("tab");

  const activeTab: SchedulingTab = isSchedulingTab(queryTab)
    ? queryTab
    : "dispatch";

  const range = getSchedulingDayRange(selectedDate);

  //************************************************************** */

  const {
    data: board,
    isLoading: boardLoading,
    isError: boardError,
  } = useGetSchedulingBoardQuery(
    {
      organizationId: organizationId ?? "",

      start: range.start,

      end: range.end,
    },
    {
      skip: !organizationId,
    },
  );

  //************************************************************** */
  // Load all appointments for selected date.
  //
  // Search/status filtering is intentionally local so the page
  // metrics remain the full selected-day totals.

  const {
    data: appointments = [],
    isLoading: appointmentsLoading,
    isError: appointmentsError,
  } = useGetServiceAppointmentsQuery(
    {
      organizationId: organizationId ?? "",

      start: range.start,

      end: range.end,
    },
    {
      skip: !organizationId,
    },
  );

  //************************************************************** */

  const filteredAppointments = useMemo(() => {
    const query = appointmentSearch.trim().toLowerCase();

    return appointments.filter((appointment) => {
      if (appointmentStatus && appointment.status !== appointmentStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const vehicle = appointment.vehicle;

      return [
        String(appointment.appointmentNumber),

        appointment.customerName,

        appointment.requestedService,

        appointment.customerComplaint,

        vehicle?.make,

        vehicle?.model,
      ]
        .filter((value): value is string => typeof value === "string")
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [appointments, appointmentSearch, appointmentStatus]);

  //************************************************************** */

  const [confirmAppointment] = useConfirmServiceAppointmentMutation();

  const [checkInAppointment] = useCheckInServiceAppointmentMutation();

  const [cancelAppointment] = useCancelServiceAppointmentMutation();

  const [convertAppointment] =
    useConvertServiceAppointmentToRepairOrderMutation();

  //************************************************************** */

  const appointmentsCount = getAppointmentsCount(appointments);

  const scheduledRepairOrders = getScheduledRepairOrderCount(
    board?.schedules ?? [],
  );

  const unscheduledRepairOrders = board?.unscheduledRepairOrders.length ?? 0;

  const shopCapacity = getShopCapacityPercent(
    board?.technicians ?? [],

    board?.schedules ?? [],
  );

  //************************************************************** */

  function updateSearchParams(next: {
    date?: Date;

    tab?: SchedulingTab;
  }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.date) {
      params.set(
        "date",

        toScheduleDateParam(next.date),
      );
    }

    if (next.tab) {
      if (next.tab === "dispatch") {
        params.delete("tab");
      } else {
        params.set("tab", next.tab);
      }
    }

    const query = params.toString();

    router.replace(query ? `/scheduling?${query}` : "/scheduling", {
      scroll: false,
    });
  }

  //************************************************************** */

  function openRepairOrder(repairOrderId: string) {
    router.push(`/repair-orders?ro=${repairOrderId}`);
  }

  //************************************************************** */

  function handleEditSchedule(block: ScheduleWorkBlock) {
    setSelectedWorkBlock(null);

    setReschedulingWorkBlock(block);
  }

  //************************************************************** */

  function closeScheduleDialog() {
    setSchedulingRepairOrder(null);

    setReschedulingWorkBlock(null);
  }

  //************************************************************** */

  async function runAppointmentAction(
    appointment: ServiceAppointment,
    action: () => Promise<unknown>,
  ) {
    setAppointmentError(null);

    setBusyAppointmentId(appointment.id);

    try {
      await action();
    } catch {
      setAppointmentError(
        `MotoDesk could not update appointment #${appointment.appointmentNumber}.`,
      );
    } finally {
      setBusyAppointmentId(null);
    }
  }

  //************************************************************** */

  async function handleConfirmAppointment(appointment: ServiceAppointment) {
    if (!organizationId) {
      return;
    }

    await runAppointmentAction(appointment, () =>
      confirmAppointment({
        organizationId,

        appointmentId: appointment.id,
      }).unwrap(),
    );
  }

  //************************************************************** */

  async function handleCheckInAppointment(appointment: ServiceAppointment) {
    if (!organizationId) {
      return;
    }

    await runAppointmentAction(appointment, () =>
      checkInAppointment({
        organizationId,

        appointmentId: appointment.id,
      }).unwrap(),
    );
  }

  //************************************************************** */

  async function handleConvertAppointment(appointment: ServiceAppointment) {
    if (!organizationId) {
      return;
    }

    setAppointmentError(null);

    setBusyAppointmentId(appointment.id);

    try {
      const result = await convertAppointment({
        organizationId,

        appointmentId: appointment.id,
      }).unwrap();

      openRepairOrder(result.repairOrder.id);
    } catch {
      setAppointmentError(
        appointment.customerId && appointment.vehicleId
          ? `MotoDesk could not convert appointment #${appointment.appointmentNumber}.`
          : "A customer and vehicle are required before this appointment can be converted to an RO.",
      );
    } finally {
      setBusyAppointmentId(null);
    }
  }

  //************************************************************** */

  async function handleCancelAppointment(reason: string) {
    if (!organizationId || !cancellingAppointment) {
      return;
    }

    const appointment = cancellingAppointment;

    setAppointmentError(null);

    setBusyAppointmentId(appointment.id);

    try {
      await cancelAppointment({
        organizationId,

        appointmentId: appointment.id,

        reason: reason || undefined,
      }).unwrap();

      setCancellingAppointment(null);
    } catch {
      setAppointmentError(
        `MotoDesk could not cancel appointment #${appointment.appointmentNumber}.`,
      );
    } finally {
      setBusyAppointmentId(null);
    }
  }

  //************************************************************** */

  const pageLoading = boardLoading || appointmentsLoading;

  const pageError = boardError || appointmentsError;

  const rescheduleRepairOrder = reschedulingWorkBlock?.repairOrder ?? null;

  //************************************************************** */

  return (
    <>
      <div className="space-y-6">
        <SchedulingHeader
          selectedDate={selectedDate}
          onPreviousDay={() =>
            updateSearchParams({
              date: addDays(selectedDate, -1),
            })
          }
          onToday={() =>
            updateSearchParams({
              date: startOfLocalDay(new Date()),
            })
          }
          onNextDay={() =>
            updateSearchParams({
              date: addDays(selectedDate, 1),
            })
          }
          onDateChange={(date) =>
            updateSearchParams({
              date,
            })
          }
          onCreateAppointment={() => setCreatingAppointment(true)}
        />

        <SchedulingMetrics
          appointments={appointmentsCount}
          scheduledRepairOrders={scheduledRepairOrders}
          unscheduledRepairOrders={unscheduledRepairOrders}
          shopCapacity={shopCapacity}
        />

        <SchedulingTabs
          activeTab={activeTab}
          appointmentsCount={appointmentsCount}
          unscheduledCount={unscheduledRepairOrders}
          onChange={(tab) =>
            updateSearchParams({
              tab,
            })
          }
        />

        {appointmentError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {appointmentError}
          </div>
        ) : null}

        {pageLoading ? (
          <SchedulingMessage>Loading scheduling...</SchedulingMessage>
        ) : pageError ? (
          <SchedulingMessage>
            MotoDesk could not load scheduling.
          </SchedulingMessage>
        ) : activeTab === "dispatch" ? (
          <DispatchBoard
            technicians={board?.technicians ?? []}
            workBlocks={board?.schedules ?? []}
            selectedDate={selectedDate}
            selectedBlockId={selectedWorkBlock?.id ?? null}
            onWorkBlockClick={setSelectedWorkBlock}
          />
        ) : activeTab === "appointments" ? (
          <ServiceAppointmentsPanel
            appointments={filteredAppointments}
            search={appointmentSearch}
            status={appointmentStatus}
            busyAppointmentId={busyAppointmentId}
            onSearchChange={setAppointmentSearch}
            onStatusChange={setAppointmentStatus}
            onConfirm={handleConfirmAppointment}
            onCheckIn={handleCheckInAppointment}
            onCancel={setCancellingAppointment}
            onConvert={handleConvertAppointment}
            onOpenRepairOrder={(appointment) => {
              if (appointment.repairOrderId) {
                openRepairOrder(appointment.repairOrderId);
              }
            }}
          />
        ) : (
          <UnscheduledWorkPanel
            repairOrders={board?.unscheduledRepairOrders ?? []}
            onSchedule={setSchedulingRepairOrder}
            onViewRepairOrder={(repairOrder) => openRepairOrder(repairOrder.id)}
          />
        )}
      </div>

      <WorkBlockDetailDialog
        workBlock={selectedWorkBlock}
        onClose={() => setSelectedWorkBlock(null)}
        onOpenRepairOrder={(block) => openRepairOrder(block.repairOrderId)}
        onEditSchedule={handleEditSchedule}
      />

      {organizationId && schedulingRepairOrder ? (
        <ScheduleRepairOrderDialog
          organizationId={organizationId}
          repairOrder={schedulingRepairOrder}
          technicians={board?.technicians ?? []}
          selectedDate={selectedDate}
          onClose={closeScheduleDialog}
          onSaved={closeScheduleDialog}
        />
      ) : null}

      {organizationId && reschedulingWorkBlock && rescheduleRepairOrder ? (
        <ScheduleRepairOrderDialog
          organizationId={organizationId}
          repairOrder={rescheduleRepairOrder}
          workBlock={reschedulingWorkBlock}
          technicians={board?.technicians ?? []}
          selectedDate={selectedDate}
          onClose={closeScheduleDialog}
          onSaved={closeScheduleDialog}
        />
      ) : null}

      {organizationId && creatingAppointment ? (
        <CreateServiceAppointmentDialog
          organizationId={organizationId}
          selectedDate={selectedDate}
          onClose={() => setCreatingAppointment(false)}
          onCreated={() => setCreatingAppointment(false)}
        />
      ) : null}

      <CancelServiceAppointmentDialog
        key={cancellingAppointment?.id ?? "closed"}
        appointment={cancellingAppointment}
        busy={Boolean(
          cancellingAppointment &&
          busyAppointmentId === cancellingAppointment.id,
        )}
        onClose={() => setCancellingAppointment(null)}
        onConfirm={handleCancelAppointment}
      />
    </>
  );
}

//************************************************************** */

function SchedulingMessage({ children }: { children: React.ReactNode }) {
  return (
    <section className="grid min-h-64 place-items-center rounded-xl border border-zinc-200 bg-white p-8 text-center">
      <p className="text-sm text-zinc-500">{children}</p>
    </section>
  );
}

//************************************************************** */

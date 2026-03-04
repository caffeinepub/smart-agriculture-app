import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CropRecord,
  IrrigationHistory,
  IrrigationSchedule,
  SensorData,
  UserProfile,
  Zone,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Zones ────────────────────────────────────────────────────────
export function useAllZones() {
  const { actor, isFetching } = useActor();
  return useQuery<Zone[]>({
    queryKey: ["zones"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllZones();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddZone() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (zone: Zone) => actor!.addZone(zone),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["zones"] }),
  });
}

export function useUpdateZone() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (zone: Zone) => actor!.updateZone(zone),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["zones"] }),
  });
}

export function useDeleteZone() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.deleteZone(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["zones"] }),
  });
}

// ─── Crops ────────────────────────────────────────────────────────
export function useAllCrops() {
  const { actor, isFetching } = useActor();
  return useQuery<CropRecord[]>({
    queryKey: ["crops"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllCrops();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCrop() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (crop: CropRecord) => actor!.addCrop(crop),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crops"] }),
  });
}

export function useUpdateCrop() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (crop: CropRecord) => actor!.updateCrop(crop),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crops"] }),
  });
}

export function useDeleteCrop() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.deleteCrop(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crops"] }),
  });
}

// ─── Sensors ──────────────────────────────────────────────────────
export function useSensorDataByZone(zoneId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SensorData[]>({
    queryKey: ["sensors", zoneId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getSensorDataByZone(zoneId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!zoneId,
  });
}

export function useAddSensorData() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SensorData) => actor!.addSensorData(data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["sensors", vars.zoneId] });
      qc.invalidateQueries({ queryKey: ["sensors"] });
    },
  });
}

// ─── Irrigation Schedules ─────────────────────────────────────────
export function useAllIrrigationSchedules() {
  const { actor, isFetching } = useActor();
  return useQuery<IrrigationSchedule[]>({
    queryKey: ["irrigation-schedules"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllIrrigationSchedules();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddIrrigationSchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (schedule: IrrigationSchedule) =>
      actor!.addIrrigationSchedule(schedule),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["irrigation-schedules"] }),
  });
}

export function useDeleteIrrigationSchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.deleteIrrigationSchedule(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["irrigation-schedules"] }),
  });
}

export function useUpdateIrrigationSchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (schedule: IrrigationSchedule) =>
      actor!.updateIrrigationSchedule(schedule),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["irrigation-schedules"] }),
  });
}

// ─── Irrigation History ───────────────────────────────────────────
export function useIrrigationHistoryByZone(zoneId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<IrrigationHistory[]>({
    queryKey: ["irrigation-history", zoneId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getIrrigationHistoryByZone(zoneId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!zoneId,
  });
}

export function useAddIrrigationHistory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (history: IrrigationHistory) =>
      actor!.addIrrigationHistory(history),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["irrigation-history"] }),
  });
}

// ─── User Profile ─────────────────────────────────────────────────
export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profile: UserProfile) => actor!.saveCallerUserProfile(profile),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-profile"] }),
  });
}

// ─── Seed Data ────────────────────────────────────────────────────
export function useInitializeSeedData() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => actor!.initializeSeedData(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["zones"] });
      qc.invalidateQueries({ queryKey: ["crops"] });
      qc.invalidateQueries({ queryKey: ["irrigation-schedules"] });
    },
  });
}

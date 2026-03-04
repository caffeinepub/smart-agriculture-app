import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Zone {
    id: string;
    soilType: string;
    area: number;
    name: string;
    coordinates: Array<Coordinates>;
}
export type Time = bigint;
export interface SensorData {
    id: string;
    soilMoisture: number;
    temperature: number;
    humidity: number;
    timestamp: Time;
    phLevel: number;
    nitrogenLevel: number;
    zoneId: string;
}
export interface IrrigationSchedule {
    id: string;
    startTime: Time;
    duration: bigint;
    waterAmount: number;
    zoneId: string;
}
export interface CropRecord {
    id: string;
    plantingDate: string;
    cropType: string;
    irrigationNeeds: number;
    zoneId: string;
    expectedYield: number;
}
export interface Coordinates {
    latitude: number;
    longitude: number;
}
export interface IrrigationHistory {
    id: string;
    startTime: Time;
    status: boolean;
    duration: bigint;
    waterAmount: number;
    zoneId: string;
}
export interface UserProfile {
    farmName: string;
    name: string;
    email: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCrop(crop: CropRecord): Promise<void>;
    addIrrigationHistory(history: IrrigationHistory): Promise<void>;
    addIrrigationSchedule(schedule: IrrigationSchedule): Promise<void>;
    addSensorData(data: SensorData): Promise<void>;
    addZone(zone: Zone): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCrop(id: string): Promise<void>;
    deleteIrrigationSchedule(id: string): Promise<void>;
    deleteSensorData(id: string): Promise<void>;
    deleteZone(id: string): Promise<void>;
    getAllCrops(): Promise<Array<CropRecord>>;
    getAllIrrigationSchedules(): Promise<Array<IrrigationSchedule>>;
    getAllZones(): Promise<Array<Zone>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCrop(id: string): Promise<CropRecord | null>;
    getIrrigationHistoryByZone(zoneId: string): Promise<Array<IrrigationHistory>>;
    getIrrigationSchedule(id: string): Promise<IrrigationSchedule | null>;
    getSensorData(id: string): Promise<SensorData | null>;
    getSensorDataByZone(zoneId: string): Promise<Array<SensorData>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getZone(id: string): Promise<Zone | null>;
    initializeSeedData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCrop(crop: CropRecord): Promise<void>;
    updateIrrigationSchedule(schedule: IrrigationSchedule): Promise<void>;
    updateZone(zone: Zone): Promise<void>;
}

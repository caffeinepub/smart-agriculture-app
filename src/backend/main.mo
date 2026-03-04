import Text "mo:core/Text";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Error "mo:core/Error";
import Order "mo:core/Order";
import List "mo:core/List";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    email : Text;
    farmName : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type Coordinates = {
    latitude : Float;
    longitude : Float;
  };

  type Zone = {
    id : Text;
    name : Text;
    area : Float; // in hectares
    coordinates : [Coordinates];
    soilType : Text;
  };

  module Zone {
    public func compareByName(zone1 : Zone, zone2 : Zone) : Order.Order {
      Text.compare(zone1.name, zone2.name);
    };
  };

  type CropRecord = {
    id : Text;
    zoneId : Text;
    cropType : Text;
    plantingDate : Text;
    expectedYield : Float; // in tons
    irrigationNeeds : Float; // water needs in liters per hectare
  };

  type SensorData = {
    id : Text;
    zoneId : Text;
    timestamp : Time.Time;
    soilMoisture : Float; // percentage
    temperature : Float; // Celsius
    humidity : Float; // percentage
    nitrogenLevel : Float; // ppm
    phLevel : Float;
  };

  type IrrigationSchedule = {
    id : Text;
    zoneId : Text;
    startTime : Time.Time;
    duration : Nat; // in minutes
    waterAmount : Float; // liters
  };

  type IrrigationHistory = {
    id : Text;
    zoneId : Text;
    startTime : Time.Time;
    duration : Nat;
    waterAmount : Float;
    status : Bool; // true if successfully completed
  };

  // Persistent storage for each entity
  let zones = Map.empty<Text, Zone>();
  let crops = Map.empty<Text, CropRecord>();
  let sensorReadings = Map.empty<Text, SensorData>();
  let irrigationSchedules = Map.empty<Text, IrrigationSchedule>();
  let irrigationHistory = Map.empty<Text, List.List<IrrigationHistory>>();

  // CRUD for zones
  public query ({ caller }) func getZone(id : Text) : async ?Zone {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access zones");
    };
    zones.get(id);
  };

  public query ({ caller }) func getAllZones() : async [Zone] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access zones");
    };
    zones.values().toArray().sort(Zone.compareByName);
  };

  public shared ({ caller }) func addZone(zone : Zone) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can add zones");
    };
    zones.add(zone.id, zone);
  };

  public shared ({ caller }) func updateZone(zone : Zone) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can update zones");
    };
    if (not zones.containsKey(zone.id)) {
      Runtime.trap("Zone not found");
    };
    zones.add(zone.id, zone);
  };

  public shared ({ caller }) func deleteZone(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can delete zones");
    };
    if (not zones.containsKey(id)) {
      switch (zones.get(id)) {
        case (null) { Runtime.trap("Zone not found") };
        case (_) {};
      };
    };
    zones.remove(id);
  };

  // CRUD for crops
  public query ({ caller }) func getCrop(id : Text) : async ?CropRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access crops");
    };
    crops.get(id);
  };

  public query ({ caller }) func getAllCrops() : async [CropRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access crops");
    };
    crops.values().toArray();
  };

  public shared ({ caller }) func addCrop(crop : CropRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can add crops");
    };
    crops.add(crop.id, crop);
  };

  public shared ({ caller }) func updateCrop(crop : CropRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can update crops");
    };
    if (not crops.containsKey(crop.id)) {
      Runtime.trap("Crop not found");
    };
    crops.add(crop.id, crop);
  };

  public shared ({ caller }) func deleteCrop(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can delete crops");
    };
    if (not crops.containsKey(id)) {
      switch (crops.get(id)) {
        case (null) { Runtime.trap("Crop not found") };
        case (_) {};
      };
    };
    crops.remove(id);
  };

  // CRUD for sensor data
  public query ({ caller }) func getSensorData(id : Text) : async ?SensorData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access sensor data");
    };
    sensorReadings.get(id);
  };

  public query ({ caller }) func getSensorDataByZone(zoneId : Text) : async [SensorData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access sensor data");
    };
    sensorReadings.values().toArray().filter(
      func(d) { d.zoneId == zoneId }
    );
  };

  public shared ({ caller }) func addSensorData(data : SensorData) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can add sensor data");
    };
    sensorReadings.add(data.id, data);
  };

  public shared ({ caller }) func deleteSensorData(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can delete sensor data");
    };
    if (not sensorReadings.containsKey(id)) {
      switch (sensorReadings.get(id)) {
        case (null) { Runtime.trap("Sensor data not found") };
        case (_) {};
      };
    };
    sensorReadings.remove(id);
  };

  // CRUD for irrigation schedules
  public query ({ caller }) func getIrrigationSchedule(id : Text) : async ?IrrigationSchedule {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access irrigation schedules");
    };
    irrigationSchedules.get(id);
  };

  public query ({ caller }) func getAllIrrigationSchedules() : async [IrrigationSchedule] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access irrigation schedules");
    };
    irrigationSchedules.values().toArray();
  };

  public shared ({ caller }) func addIrrigationSchedule(schedule : IrrigationSchedule) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can add irrigation schedules");
    };
    irrigationSchedules.add(schedule.id, schedule);
  };

  public shared ({ caller }) func updateIrrigationSchedule(schedule : IrrigationSchedule) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can update irrigation schedules");
    };
    if (not irrigationSchedules.containsKey(schedule.id)) {
      Runtime.trap("Schedule not found");
    };
    irrigationSchedules.add(schedule.id, schedule);
  };

  public shared ({ caller }) func deleteIrrigationSchedule(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can delete irrigation schedules");
    };
    if (not irrigationSchedules.containsKey(id)) {
      switch (irrigationSchedules.get(id)) {
        case (null) { Runtime.trap("Schedule not found") };
        case (_) {};
      };
    };
    irrigationSchedules.remove(id);
  };

  // Irrigation history management
  public query ({ caller }) func getIrrigationHistoryByZone(zoneId : Text) : async [IrrigationHistory] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access irrigation history");
    };
    switch (irrigationHistory.get(zoneId)) {
      case (?historyList) { historyList.toArray() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func addIrrigationHistory(history : IrrigationHistory) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can add irrigation history");
    };
    let existingHistory = switch (irrigationHistory.get(history.zoneId)) {
      case (?historyList) { historyList.clone() };
      case (null) { List.empty<IrrigationHistory>() };
    };
    existingHistory.add(history);
    irrigationHistory.add(history.zoneId, existingHistory);
  };

  // Demo seed data
  public shared ({ caller }) func initializeSeedData() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can initialize seed data");
    };

    // Seed zones
    let zoneSeed : Zone = {
      id = "zone-1";
      name = "North Field";
      area = 10.5;
      coordinates = [{
        latitude = 45.67;
        longitude = -120.45;
      }];
      soilType = "Loamy";
    };
    zones.add(zoneSeed.id, zoneSeed);

    // Seed crop record
    let cropSeed : CropRecord = {
      id = "crop-1";
      zoneId = "zone-1";
      cropType = "Corn";
      plantingDate = "2024-03-15";
      expectedYield = 4.2;
      irrigationNeeds = 120.0;
    };
    crops.add(cropSeed.id, cropSeed);

    // Seed sensor data
    let sensorSeed : SensorData = {
      id = "sensor-1";
      zoneId = "zone-1";
      timestamp = 1713196800000000000;
      soilMoisture = 45.7;
      temperature = 22.3;
      humidity = 59.8;
      nitrogenLevel = 22.1;
      phLevel = 6.4;
    };
    sensorReadings.add(sensorSeed.id, sensorSeed);

    // Seed irrigation schedule
    let scheduleSeed : IrrigationSchedule = {
      id = "schedule-1";
      zoneId = "zone-1";
      startTime = 1713200400000000000;
      duration = 45;
      waterAmount = 250.0;
    };
    irrigationSchedules.add(scheduleSeed.id, scheduleSeed);
  };
};

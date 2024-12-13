import {ATCOCode} from "../reference/NaPTAN";
import {Duration, LocalDate, LocalTime} from "js-joda";

/**
 * Trimmed down version of the JSON generated by the XML parser
 */
export interface TransXChange {
  StopPoints: StopPoint[],
  RouteLinks: RouteLinks,
  JourneySections: JourneyPatternSections,
  JPTimingLinks: JPTimingLinks,
  Operators: Operators,
  Services: Services,
  VehicleJourneys: VehicleJourney[]
}

/**
 * RouteLinks indexed by ID
 */
export type RouteLinks = Record<string, RouteLink>;

/**
 * JourneyPatternSections indexed by id
 */
export type JourneyPatternSections = Record<JourneyPatternSectionID, JPTimingLink[]>;


/**
 * JourneyPatternTimingLinks indexed by ID
 */
export type JPTimingLinks = Record<string, JPTimingLink>;

/**
 * E.g. JPSection-45
 */
export type JourneyPatternSectionID = string;

/**
 * AnnotatedStopPointRef from TransXChange feed
 */
export interface StopPoint {
  StopPointRef: ATCOCode,
  CommonName: string,
  LocalityName: string,
  LocalityQualifier: string,
  Location: Location
}

export interface Location {
  Latitude: number,
  Longitude: number
}

/**
 * RouteLink
 */
export interface RouteLink {
  From: ATCOCode,
  To: ATCOCode,
  Distance: number,
  Locations: Location[]
}

/**
 * JourneyPatternTimingLink
 */
export interface JPTimingLink {
  From: JPJourneyStop,
  To: JPJourneyStop,
  RunTime: Duration,
  RouteLinkRef: string
}

/**
 * VehicleJourneyTimingLink
 */
export interface VJTimingLink {
  JPTimingLinkRef: string, // Values inherited from JPTimingLink
  From?: VJJourneyStop,
  To?: VJJourneyStop,
  RunTime?: Duration
}

/**
 * From/To field inside a JourneyPatternTimingLink
 */
export interface JPJourneyStop {
  Activity: StopActivity,
  StopPointRef: ATCOCode,
  TimingStatus: TimingStatus,
  WaitTime?: Duration,
  DynamicDestinationDisplay?: string
}

export enum TimingStatus {
  PrincipalTimingPoint = "principalTimingPoint",
  TimeInfoPoint = "timeInfoPoint",
  OtherPoint = "otherPoint"
}

/**
 * From/To field inside a VehicleJourneyTimingLink
 */
export interface VJJourneyStop {
  Activity?: StopActivity,
  WaitTime?: Duration
}

/**
 * Types of Activity at a From/To location
 */
export enum StopActivity {
  PickUp = "pickUp",
  PickUpAndSetDown = "pickUpAndSetDown",
  SetDown = "setDown",
  Pass = "pass"
}

/**
 * Operators indexed by ID
 */
export type Operators = Record<OperatorID, Operator>;

/**
 * Operator ID e.g. OId_MEGA (not to be confused with OperatorCode)
 */
export type OperatorID = string;

/**
 * Operator
 */
export interface Operator {
  NationalOperatorCode: string,
  OperatorCode: string,
  OperatorShortName: string,
  OperatorNameOnLicence: string | undefined,
  TradingName: string | undefined
}

/**
 * e.g. M6_MEGA
 */
export type ServiceCode = string;

/**
 * Services indexed by code
 */
export type Services = Record<ServiceCode, Service>;

/**
 * Service
 */
export interface Service {
  ServiceCode: ServiceCode,
  Lines: Lines,
  OperatingPeriod: DateRange,
  RegisteredOperatorRef: OperatorID,
  Description: string,
  Mode: Mode,
  ServiceDestination: string,
  ServiceOrigin: string,
  StandardService: JourneyPatterns,
  OperatingProfile: OperatingProfile | undefined
}

/**
 * JourneyPatterns indexed by pattern ID
 */
export type JourneyPatterns = Record<JourneyPatternID, JourneyPattern>;

/**
 * From a JourneyPattern
 */
export interface JourneyPattern {
  Direction: "inbound" | "outbound",
  Sections: JourneyPatternSectionID[],
  DestinationDisplay?: string
}

/**
 * JourneyPatternID e.g. JP366
 */
export type JourneyPatternID = string;

/**
 * Lines indexed by line ID
 */
export type Lines = Record<string, Line>;

/**
 * Line
 */
export interface Line {
  LineName: string,
  Description: string
}

/**
 * Period of operation
 */
export interface DateRange {
  StartDate: LocalDate,
  EndDate: LocalDate
}

/**
 * Transport mode
 */
export enum Mode {
  Air = "air",
  Bus = "bus",
  Coach = "coach",
  Underground = "underground",
  Ferry = "ferry",
  Train = "train",
  Tram = "tram"
}

/**
 * Vehicle journeys
 */
export interface VehicleJourney {
  OperatingProfile: OperatingProfile,
  ServiceRef: ServiceCode,
  LineRef: string,
  JourneyPatternRef: string,
  DepartureTime: LocalTime,
  VehicleJourneyCode: string,
  OperationalBlockNumber?: string,
  TimingLinks?: VJTimingLink[]
}

export interface OperatingProfile {
  RegularDayType: "HolidaysOnly" | DaysOfWeek[]
  SpecialDaysOperation: {
    DaysOfOperation: DateRange[],
    DaysOfNonOperation: DateRange[]
  },
  BankHolidayOperation: {
    DaysOfOperation: Holiday[],
    DaysOfNonOperation: Holiday[]
  }
}

/**
 * Another touch of TransXChange genius.
 */
export enum Holiday {
  ChristmasEve = "ChristmasEve",
  ChristmasDay = "ChristmasDay",
  BoxingDay = "BoxingDay",
  NewYearsEve = "NewYearsEve",
  NewYearsDay = "NewYearsDay",
  Jan2ndScotland = "Jan2ndScotland",
  ChristmasDayHoliday = "ChristmasDayHoliday",
  BoxingDayHoliday = "BoxingDayHoliday",
  NewYearsDayHoliday = "NewYearsDayHoliday",
  Jan2ndHoliday = "Jan2ndHoliday",
  LateSummerBankHolidayNotScotland = "LateSummerBankHolidayNotScotland",
  MayDay = "MayDay",
  EasterMonday = "EasterMonday",
  SpringBank = "SpringBank",
  AugustBankHolidayScotland = "AugustBankHolidayScotland",
  GoodFriday = "GoodFriday",
  AllBankHolidays = "AllBankHolidays"
}

/**
 * Integer representation of a boolean
 */
export type IntBool = 0 | 1;

/**
 * Days of operation as an array of booleans. 0 = Monday, Sunday = 6
 */
export type DaysOfWeek = [IntBool, IntBool, IntBool, IntBool, IntBool, IntBool, IntBool];

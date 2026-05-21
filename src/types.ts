/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = "en" | "hi" | "te" | "ta" | "bn" | "kn";

export interface LocalizedScheme {
  name: string;
  description: string;
  shortDescription: string;
  procedures: string[];
}

export interface DbScheme {
  id: string;
  title: string;
  category: string;
  ministry: string | null;
  benefits: string | null;
  eligibility_criteria: Record<string, any> | null;
  documents_required: string[] | null;
  application_process: string | null;
  deadline: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Scheme {
  id: string;
  name: string;
  category: "Healthcare" | "Education" | "Agriculture" | "Social Welfare" | "Employment";
  description: string;
  shortDescription: string;
  eligibility: string[];
  benefits: string[];
  documentation: string[];
  procedures: string[];
  deadline?: string;
  estimatedProcessingTime: string;
  translations?: Partial<Record<Language, LocalizedScheme>>;
}

export interface UserProfile {
  id?: string;
  email?: string;
  jana_seva_id?: string;
  name: string;
  age: number;
  income: number;
  occupation: string;
  location: string;
  gender: "Male" | "Female" | "Other" | "";
  demographics: {
    isFarmer: boolean;
    isStudent: boolean;
    isSeniorCitizen: boolean;
    isDifferentlyAbled: boolean;
    isStartupFounder: boolean;
    isUnemployed: boolean;
    isFemaleStudent: boolean;
    isWorkingFemale: boolean;
    isPregnantWoman: boolean;
    isWidow: boolean;
    isSingleMother: boolean;
    isOtherProfession: boolean;
    familySize: number;
  };
}

export interface ApplicationStatus {
  id: string;
  schemeId: string;
  schemeName: string;
  status: "Pending" | "In Review" | "Action Required" | "Approved" | "Rejected";
  appliedDate: string;
  lastUpdated: string;
  nextStep?: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  language?: Language;
}

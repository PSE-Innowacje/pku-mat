export interface UserResponse {
  id: number;
  username: string;
  displayName: string;
  role: string;
}

export interface DashboardResponse {
  contractorName: string;
  contractorType: string;
  year: number;
  month: number;
  feeDeclarations: FeeDeclarationStatus[];
}

export interface FeeDeclarationStatus {
  feeTypeCode: string;
  feeTypeName: string;
  status: string;
  declarationId: number | null;
  declarationNumber: string | null;
}

export interface FormFieldDef {
  code: string;
  label: string;
  type: string;
  precision: number;
  unit: string | null;
  required: boolean;
}

export interface DeclarationFormTemplate {
  feeTypeCode: string;
  feeTypeName: string;
  contractorTypeCode: string;
  fields: FormFieldDef[];
  commentAllowed: boolean;
}

export interface DeclarationSubmitRequest {
  feeTypeCode: string;
  year: number;
  month: number;
  subPeriod: number;
  items: Record<string, number>;
  comment?: string;
}

export interface DeclarationResponse {
  id: number;
  declarationNumber: string;
  status: string;
  feeTypeCode: string;
  feeTypeName: string;
  contractorName: string;
  year: number;
  month: number;
  version: number;
  items: Record<string, number>;
  comment?: string;
  submittedAt?: string;
  createdBy: string;
}

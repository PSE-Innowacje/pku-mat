import { apiRequest } from './client';
import {
  DashboardResponse,
  DeclarationFormTemplate,
  DeclarationResponse,
  DeclarationSubmitRequest,
} from '../types';

export function getDashboard(): Promise<DashboardResponse> {
  return apiRequest<DashboardResponse>('/dashboard');
}

export function getFormTemplate(
  feeType: string,
  billingPeriodId: number
): Promise<DeclarationFormTemplate> {
  return apiRequest<DeclarationFormTemplate>(
    `/declarations/form?feeType=${encodeURIComponent(feeType)}&billingPeriodId=${billingPeriodId}`
  );
}

export function submitDeclaration(
  request: DeclarationSubmitRequest
): Promise<DeclarationResponse> {
  return apiRequest<DeclarationResponse>('/declarations', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function getDeclarations(): Promise<DeclarationResponse[]> {
  return apiRequest<DeclarationResponse[]>('/declarations');
}

export function getDeclarationsByBillingPeriod(
  billingPeriodId: number
): Promise<DeclarationResponse[]> {
  return apiRequest<DeclarationResponse[]>(
    `/declarations/by-period/${billingPeriodId}`
  );
}

export function getDeclaration(id: number): Promise<DeclarationResponse> {
  return apiRequest<DeclarationResponse>(`/declarations/${id}`);
}

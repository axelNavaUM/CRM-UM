export interface RoleBasedContent {
  showCareerChangePetitions: boolean;
  showLogs: boolean;
  showStudentsByGroups: boolean;
  showStudentsWithMissingDocuments: boolean;
  showStudentsWithPendingPayments: boolean;
  showAsesorStudents: boolean;
  showMetrics: boolean;
  showDefaultContent: boolean;
  role: string;
  area: string;
}

export interface DashboardMetrics {
  totalRegistrations: number;
  pendingRegistrations: number;
  totalPetitions: number;
  pendingPetitions: number;
  registrationsByAdvisor: { [key: string]: number };
  petitionsByAdvisor: { [key: string]: number };
}

export interface UserRoleInfo {
  idusuario: number;
  idarea: number;
  nombrearea: string;
  rolarea: string;
} 
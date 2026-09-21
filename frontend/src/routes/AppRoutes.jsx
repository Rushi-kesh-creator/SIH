import { Routes, Route } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import RoleRoute from '../components/RoleRoute.jsx'
import AuthLayout from '../layouts/AuthLayout.jsx'
import DashboardLayout from '../layouts/DashboardLayout.jsx'

import Landing from '../pages/public/Landing.jsx'
import About from '../pages/public/About.jsx'
import Opportunities from '../pages/public/Opportunities.jsx'
import Login from '../pages/auth/Login.jsx'
import Register from '../pages/auth/Register.jsx'
import NotFound from '../pages/public/NotFound.jsx'

// Student
import StudentDashboard from '../pages/student/Dashboard.jsx'
import StudentProfile from '../pages/student/Profile.jsx'
import StudentSkills from '../pages/student/Skills.jsx'
import StudentSkillAssessment from '../pages/student/SkillAssessment.jsx'
import StudentSkillGap from '../pages/student/SkillGap.jsx'
import StudentInternships from '../pages/student/Internships.jsx'
import StudentJobs from '../pages/student/Jobs.jsx'
import StudentRecommended from '../pages/student/Recommended.jsx'
import OpportunityDetails from '../pages/student/OpportunityDetails.jsx'
import StudentApplications from '../pages/student/Applications.jsx'
import StudentCertifications from '../pages/student/Certifications.jsx'
import StudentProjects from '../pages/student/Projects.jsx'
import StudentPortfolio from '../pages/student/Portfolio.jsx'
import StudentCareerGuidance from '../pages/student/CareerGuidance.jsx'
import StudentPlacementReadiness from '../pages/student/PlacementReadiness.jsx'
import StudentNotifications from '../pages/student/Notifications.jsx'
import StudentSettings from '../pages/student/Settings.jsx'

// Academician
import AcademicianDashboard from '../pages/academician/Dashboard.jsx'
import AcademicianProfile from '../pages/academician/Profile.jsx'
import AcademicianFacultyOpportunities from '../pages/academician/FacultyOpportunities.jsx'
import AcademicianIndustrialTraining from '../pages/academician/IndustrialTraining.jsx'
import AcademicianFDPs from '../pages/academician/FDPs.jsx'
import AcademicianConsultancy from '../pages/academician/Consultancy.jsx'
import AcademicianResearchCollaboration from '../pages/academician/ResearchCollaboration.jsx'
import AcademicianMentorship from '../pages/academician/Mentorship.jsx'
import AcademicianWorkshops from '../pages/academician/Workshops.jsx'
import AcademicianGuestLectures from '../pages/academician/GuestLectures.jsx'
import AcademicianLiveProjects from '../pages/academician/LiveProjects.jsx'
import AcademicianApplications from '../pages/academician/Applications.jsx'
import AcademicianNotifications from '../pages/academician/Notifications.jsx'
import AcademicianSettings from '../pages/academician/Settings.jsx'

// Industry
import IndustryDashboard from '../pages/industry/Dashboard.jsx'
import IndustryCompanyProfile from '../pages/industry/CompanyProfile.jsx'
import IndustryPostInternship from '../pages/industry/PostInternship.jsx'
import IndustryPostJob from '../pages/industry/PostJob.jsx'
import IndustryManageInternships from '../pages/industry/ManageInternships.jsx'
import IndustryManageJobs from '../pages/industry/ManageJobs.jsx'
import IndustryApplicants from '../pages/industry/Applicants.jsx'
import IndustryApplicationDetails from '../pages/industry/ApplicationDetails.jsx'
import IndustryShortlisted from '../pages/industry/Shortlisted.jsx'
import IndustryInterviews from '../pages/industry/Interviews.jsx'
import IndustryTraining from '../pages/industry/Training.jsx'
import IndustryWorkshops from '../pages/industry/Workshops.jsx'
import IndustryMentorship from '../pages/industry/Mentorship.jsx'
import IndustryInnovationChallenges from '../pages/industry/InnovationChallenges.jsx'
import IndustryLiveProjects from '../pages/industry/LiveProjects.jsx'
import IndustryResearchCollaboration from '../pages/industry/ResearchCollaboration.jsx'
import IndustryAnalytics from '../pages/industry/Analytics.jsx'
import IndustrySettings from '../pages/industry/Settings.jsx'

// Admin
import AdminDashboard from '../pages/admin/Dashboard.jsx'
import AdminStudents from '../pages/admin/Students.jsx'
import AdminAcademicians from '../pages/admin/Academicians.jsx'
import AdminIndustries from '../pages/admin/Industries.jsx'
import AdminSkills from '../pages/admin/Skills.jsx'
import AdminInternships from '../pages/admin/Internships.jsx'
import AdminJobs from '../pages/admin/Jobs.jsx'
import AdminApplications from '../pages/admin/Applications.jsx'
import AdminSkillAnalytics from '../pages/admin/SkillAnalytics.jsx'
import AdminIndustryDemand from '../pages/admin/IndustryDemand.jsx'
import AdminPlacementAnalytics from '../pages/admin/PlacementAnalytics.jsx'
import AdminReports from '../pages/admin/Reports.jsx'
import AdminSettings from '../pages/admin/Settings.jsx'

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/opportunities" element={<PublicLayout><Opportunities /></PublicLayout>} />

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Student */}
          <Route element={<RoleRoute allow={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/skills" element={<StudentSkills />} />
            <Route path="/student/skill-assessment" element={<StudentSkillAssessment />} />
            <Route path="/student/skill-gap" element={<StudentSkillGap />} />
            <Route path="/student/internships" element={<StudentInternships />} />
            <Route path="/student/jobs" element={<StudentJobs />} />
            <Route path="/student/recommended" element={<StudentRecommended />} />
            <Route path="/student/opportunity/:type/:id" element={<OpportunityDetails />} />
            <Route path="/student/applications" element={<StudentApplications />} />
            <Route path="/student/certifications" element={<StudentCertifications />} />
            <Route path="/student/projects" element={<StudentProjects />} />
            <Route path="/student/portfolio" element={<StudentPortfolio />} />
            <Route path="/student/career-guidance" element={<StudentCareerGuidance />} />
            <Route path="/student/placement-readiness" element={<StudentPlacementReadiness />} />
            <Route path="/student/notifications" element={<StudentNotifications />} />
            <Route path="/student/settings" element={<StudentSettings />} />
          </Route>

          {/* Academician */}
          <Route element={<RoleRoute allow={['academician']} />}>
            <Route path="/academician/dashboard" element={<AcademicianDashboard />} />
            <Route path="/academician/profile" element={<AcademicianProfile />} />
            <Route path="/academician/faculty-opportunities" element={<AcademicianFacultyOpportunities />} />
            <Route path="/academician/industrial-training" element={<AcademicianIndustrialTraining />} />
            <Route path="/academician/fdps" element={<AcademicianFDPs />} />
            <Route path="/academician/consultancy" element={<AcademicianConsultancy />} />
            <Route path="/academician/research-collaboration" element={<AcademicianResearchCollaboration />} />
            <Route path="/academician/mentorship" element={<AcademicianMentorship />} />
            <Route path="/academician/workshops" element={<AcademicianWorkshops />} />
            <Route path="/academician/guest-lectures" element={<AcademicianGuestLectures />} />
            <Route path="/academician/live-projects" element={<AcademicianLiveProjects />} />
            <Route path="/academician/applications" element={<AcademicianApplications />} />
            <Route path="/academician/notifications" element={<AcademicianNotifications />} />
            <Route path="/academician/settings" element={<AcademicianSettings />} />
          </Route>

          {/* Industry */}
          <Route element={<RoleRoute allow={['company']} />}>
            <Route path="/company/dashboard" element={<IndustryDashboard />} />
            <Route path="/company/profile" element={<IndustryCompanyProfile />} />
            <Route path="/company/internships" element={<IndustryManageInternships />} />
            <Route path="/company/jobs" element={<IndustryManageJobs />} />
            <Route path="/company/applications" element={<IndustryApplicants />} />
            <Route path="/company/applications/:applicationId" element={<IndustryApplicationDetails />} />
          </Route>

          <Route element={<RoleRoute allow={['industry']} />}>
            <Route path="/industry/dashboard" element={<IndustryDashboard />} />
            <Route path="/industry/profile" element={<IndustryCompanyProfile />} />
            <Route path="/industry/post-internship" element={<IndustryPostInternship />} />
            <Route path="/industry/post-job" element={<IndustryPostJob />} />
            <Route path="/industry/manage-internships" element={<IndustryManageInternships />} />
            <Route path="/industry/manage-jobs" element={<IndustryManageJobs />} />
            <Route path="/industry/applicants" element={<IndustryApplicants />} />
            <Route path="/industry/shortlisted" element={<IndustryShortlisted />} />
            <Route path="/industry/interviews" element={<IndustryInterviews />} />
            <Route path="/industry/training" element={<IndustryTraining />} />
            <Route path="/industry/workshops" element={<IndustryWorkshops />} />
            <Route path="/industry/mentorship" element={<IndustryMentorship />} />
            <Route path="/industry/innovation-challenges" element={<IndustryInnovationChallenges />} />
            <Route path="/industry/live-projects" element={<IndustryLiveProjects />} />
            <Route path="/industry/research-collaboration" element={<IndustryResearchCollaboration />} />
            <Route path="/industry/analytics" element={<IndustryAnalytics />} />
            <Route path="/industry/settings" element={<IndustrySettings />} />
          </Route>

          {/* Admin */}
          <Route element={<RoleRoute allow={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/academicians" element={<AdminAcademicians />} />
            <Route path="/admin/industries" element={<AdminIndustries />} />
            <Route path="/admin/skills" element={<AdminSkills />} />
            <Route path="/admin/internships" element={<AdminInternships />} />
            <Route path="/admin/jobs" element={<AdminJobs />} />
            <Route path="/admin/applications" element={<AdminApplications />} />
            <Route path="/admin/skill-analytics" element={<AdminSkillAnalytics />} />
            <Route path="/admin/industry-demand" element={<AdminIndustryDemand />} />
            <Route path="/admin/placement-analytics" element={<AdminPlacementAnalytics />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
    </Routes>
  )
}

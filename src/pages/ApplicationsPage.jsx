import { useEffect, useState } from "react";
import { Badge, Card, EmptyState, LoadingState, PageShell, PrimaryButton, SecondaryButton } from "../components/ui";
import { useAuth } from "../context/authState";
import { formatDate, subscribeAdminApplications, subscribeStudentApplications, updateApplicationStatus } from "../services/platformService";
import { withLoadingSafety } from "../utils/subscriptionSafety";

const statuses = ["Pending", "Reviewed", "Accepted", "Rejected"];

export default function ApplicationsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user?.uid) return;
    const clearSafety = withLoadingSafety(setLoading);
    const unsubscribe = isAdmin
      ? subscribeAdminApplications((items) => {
          clearSafety();
          setApplications(items);
          setLoading(false);
        })
      : subscribeStudentApplications(user.uid, (items) => {
          clearSafety();
          setApplications(items);
          setLoading(false);
        });

    return () => {
      clearSafety();
      unsubscribe?.();
    };
  }, [isAdmin, user?.uid]);

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      await updateApplicationStatus(applicationId, status);
      setMessage(`Application marked as ${status}.`);
    } catch (error) {
      setMessage(error.message || "Unable to update application.");
    }
  };

  if (loading) return <LoadingState label="Loading applications..." />;

  return (
    <PageShell title={isAdmin ? "Applications" : "My Applications"} subtitle={isAdmin ? "Review applicants, inspect student profiles, and update application status." : "Track the status of every opportunity application in one place."}>
      {message ? <Card className="text-sm text-tm-dark">{message}</Card> : null}
      {applications.length === 0 ? (
        <EmptyState title="No applications yet" description={isAdmin ? "Applications will appear here when students apply to your opportunities." : "Apply to opportunities and your submissions will appear here."} />
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-tm-dark">{application.opportunityTitle}</h2>
                  <p className="mt-1 text-sm text-tm-muted">{application.opportunityType}</p>
                  {isAdmin ? (
                    <div className="mt-4 space-y-1 text-sm text-tm-muted">
                      <p><span className="font-medium text-tm-dark">Applicant Name:</span> {application.studentName}</p>
                      <p><span className="font-medium text-tm-dark">Skills:</span> {(application.studentSkills || []).join(", ") || "No skills listed"}</p>
                      <p><span className="font-medium text-tm-dark">Profile:</span> {application.studentBio || "No bio provided"}</p>
                    </div>
                  ) : null}
                  <p className="mt-4 text-xs text-tm-muted">Applied on {formatDate(application.createdAt, { includeTime: true })}</p>
                </div>
                <Badge tone={application.status === "Accepted" ? "green" : application.status === "Rejected" ? "red" : application.status === "Reviewed" ? "blue" : "amber"}>{application.status}</Badge>
              </div>

              {isAdmin ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  {statuses.map((status) => (
                    status === application.status ? (
                      <SecondaryButton key={status} type="button" disabled>{status}</SecondaryButton>
                    ) : (
                      <PrimaryButton key={status} type="button" onClick={() => handleStatusUpdate(application.id, status)}>{status}</PrimaryButton>
                    )
                  ))}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}

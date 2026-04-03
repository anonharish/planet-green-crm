import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export const VisitFeedbackAuditPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const visit = location.state?.visit;

  if (!visit) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h2 className="text-xl font-bold">Visit Data Not Found</h2>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const firstName = visit.c_first_name || '';
  const lastName = visit.c_last_name || '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'NA';
  const leadId = visit.lead_id || `PG-${visit.id}`;
  const locationUrl = visit.visit_location_url || '#';
  const remarks = visit.visit_remarks || '';

  // Parse Images JSON Array string -> string[]
  let images: string[] = [];
  try {
    if (visit.visit_images_location) {
      // The JSON comes as a string representation of an array according to the specs
      const parsed = JSON.parse(visit.visit_images_location);
      if (Array.isArray(parsed)) {
        images = parsed;
      }
    }
  } catch (err) {
    console.error("Failed to parse visit images", err);
  }

  const handleLeadDetailsClick = () => {
    if (visit.lead_uuid) {
      window.open(`/leads/${visit.lead_uuid}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent dark:bg-zinc-950 py-8 px-4 md:px-6 space-y-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          className="h-10 w-10 p-0 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5 text-[#0f3d6b] dark:text-zinc-100" />
        </Button>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary dark:text-zinc-100 tracking-tight">
          Visit Feedback Audit
        </h1>
      </div>

      <div className="flex gap-6 items-start w-full">
        {/* Left Column (Approx 30%) */}
        <div className="w-[35%] bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col items-center text-center">
          <div className="flex items-center gap-4 w-full">
            <div className="h-20 w-20 bg-[#0f3d6b] rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-[#0f3d6b]/20 shrink-0">
              {initials}
            </div>
            <div className="flex flex-col items-start">
               <h2 className="text-2xl font-black text-[#0f3d6b] dark:text-zinc-100">
                 {firstName} {lastName}
               </h2>
               <p className="text-sm font-medium text-zinc-500">Lead ID: #{leadId}</p>
            </div>
          </div>

          <div className="w-full mt-8 bg-zinc-50 dark:bg-zinc-950 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
            <div className="text-sm text-zinc-500 font-medium text-left">Site Visited:</div>
            <a 
              href={locationUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-lg font-bold text-zinc-900 dark:text-zinc-100 hover:text-[#0f3d6b] dark:hover:text-blue-400 text-left block mt-1 break-all"
            >
              {locationUrl !== '#' ? locationUrl : 'No Location Recorded'}
            </a>
          </div>

          <Button 
            className="w-full mt-8 h-14 bg-[#0f3d6b] hover:bg-[#0c3156] text-white font-bold text-lg rounded-full shadow-lg shadow-[#0f3d6b]/20"
            onClick={handleLeadDetailsClick}
          >
            View Lead Details
          </Button>
        </div>

        {/* Right Column (Approx 70%) */}
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col items-start min-h-[380px]">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">Key Feedback Summary</h2>
          
          <div className="mt-8 flex flex-col gap-6 w-full">
            <div className="relative pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0f3d6b] rounded-full"></div>
              <h3 className="text-xs font-bold text-[#0f3d6b] uppercase tracking-widest mb-2">VISIT REMARKS</h3>
              <p className="text-lg text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                {remarks ? `"${remarks}"` : <span className="text-zinc-400 italic">No feedback summary recorded.</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Media Section */}
      <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">Visit Media & Site Photos</h2>
            <p className="text-sm font-medium text-zinc-500 mt-1">Visual documentation captured during the walkthrough</p>
          </div>
          {images.length > 0 && (
            <Button variant="secondary" className="font-bold rounded-full px-6 bg-zinc-100 text-[#0f3d6b] hover:bg-zinc-200 h-10">
              View All ({images.length})
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {images.length > 0 ? (
            images.map((imgUrl, i) => (
              <div key={i} className="rounded-2xl overflow-hidden aspect-[4/3] bg-zinc-100 relative group border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <img 
                  src={imgUrl} 
                  alt={`Site photo ${i + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))
          ) : (
            <div className="col-span-3 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-16">
              <div className="h-16 w-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <p className="text-zinc-500 font-medium">No media uploaded for this visit.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

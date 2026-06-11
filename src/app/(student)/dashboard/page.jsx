import React from 'react';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import { FileText, Calendar, Briefcase, MessageSquare, ArrowUp, ChevronRight, Megaphone, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { userName } = useOutletContext() || { userName: 'Ayush' };
  const navigate = useNavigate();
  
  return (
    <div className="max-w-[1440px] mx-auto w-full space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface" style={{ fontWeight: 'bold', fontSize: '30px' }}>Hello, {userName} 👋</h2>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Notes" value="142" icon={FileText} trend="+12" trendUp colorClass="text-primary bg-primary/10" onClick={() => navigate('/notes')} />
        <StatCard title="Upcoming Events" value="8" icon={Calendar} colorClass="text-accent-purple bg-accent-purple/10" onClick={() => navigate('/events')} />
        <StatCard title="Active Drives" value="5" icon={Briefcase} colorClass="text-[#f59e0b] bg-[#f59e0b]/10" onClick={() => navigate('/placement')} />
        <StatCard title="Forum Posts" value="89" icon={MessageSquare} colorClass="text-[#3b82f6] bg-[#3b82f6]/10" onClick={() => navigate('/forum')} />
      </div>

      {/* Main Layout (3:2 Ratio) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 border-t border-border-subtle/0 pt-2">
        
        {/* Left Column (3) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Recent Notes Card */}
          <div className="bg-surface-white rounded-[20px] border border-border-subtle shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="p-5 border-b border-border-subtle flex justify-between items-center bg-surface-white">
              <h3 className="font-headline-md text-headline-md text-on-surface text-lg">Recent Notes</h3>
              <Link to="/notes" className="font-label-sm text-label-sm text-primary hover:underline hover:text-accent-purple transition-colors">View All</Link>
            </div>
            <ul className="divide-y divide-border-subtle">
              <ListItem icon="pdf" title="Data Structures Unit 4" meta="Prof. Sharma • 2 hours ago" onClick={() => alert('Opening Data Structures Unit 4...')} />
              <ListItem icon="doc" title="Operating Systems Notes" meta="Rahul K. • Yesterday" onClick={() => alert('Opening Operating Systems Notes...')} />
              <ListItem icon="xls" title="Project Timeline Sheet" meta="Team Alpha • 2 days ago" onClick={() => alert('Opening Project Timeline Sheet...')} />
              <ListItem icon="pdf" title="Computer Networks Assignment" meta="Prof. Gupta • 3 days ago" onClick={() => alert('Opening Computer Networks Assignment...')} />
            </ul>
          </div>

          {/* Upcoming Events Card */}
          <div className="bg-surface-white rounded-[20px] border border-border-subtle shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="p-5 border-b border-border-subtle flex justify-between items-center bg-surface-white">
              <h3 className="font-headline-md text-headline-md text-on-surface text-lg">Upcoming Events</h3>
              <Link to="/events" className="font-label-sm text-label-sm text-primary hover:underline hover:text-accent-purple transition-colors">View All</Link>
            </div>
            <div className="p-5 space-y-4">
              <EventItem month="May" day="18" title="Annual Tech Symposium" time="10:00 AM - Main Auditorium" onClick={() => alert('Viewing Annual Tech Symposium...')} />
              <EventItem month="May" day="22" title="Guest Lecture: AI in Healthcare" time="2:00 PM - Seminar Hall B" onClick={() => alert('Viewing Guest Lecture: AI in Healthcare...')} />
              <EventItem month="Jun" day="05" title="Coding Hackathon 2024" time="9:00 AM - CS Labs" onClick={() => alert('Viewing Coding Hackathon 2024...')} />
            </div>
          </div>
        </div>

        {/* Right Column (2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Drives Card */}
          <div className="bg-surface-white rounded-[20px] border border-border-subtle shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="p-5 border-b border-border-subtle bg-surface-white flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-on-surface text-lg">Active Drives</h3>
              <Link to="/placement" className="font-label-sm text-label-sm text-primary hover:underline hover:text-accent-purple transition-colors">View All</Link>
            </div>
            <div className="p-5 space-y-5">
              <DriveItem init="G" title="Google - SDE Intern" meta="Deadline: Tomorrow" colorClass="bg-[#3b82f6]/10 text-[#3b82f6]" onClick={() => alert('Viewing Google - SDE Intern...')} />
              <DriveItem init="A" title="Amazon - AWS Engineer" meta="Deadline: 20 May" colorClass="bg-[#f59e0b]/10 text-[#f59e0b]" onClick={() => alert('Viewing Amazon - AWS Engineer...')} />
              <DriveItem init="M" title="Microsoft - PM Role" meta="Deadline: 25 May" colorClass="bg-[#10b981]/10 text-[#10b981]" onClick={() => alert('Viewing Microsoft - PM Role...')} />
              <DriveItem init="D" title="Deloitte - Analyst" meta="Deadline: 01 Jun" colorClass="bg-accent-purple/10 text-accent-purple" onClick={() => alert('Viewing Deloitte - Analyst...')} />
            </div>
          </div>

          {/* Recent Discussions Card */}
          <div className="bg-surface-white rounded-[20px] border border-border-subtle shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="p-5 border-b border-border-subtle bg-surface-white flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-on-surface text-lg">Recent Discussions</h3>
              <Link to="/forum" className="font-label-sm text-label-sm text-primary hover:underline hover:text-accent-purple transition-colors">View All</Link>
            </div>
            <ul className="divide-y divide-border-subtle">
              <DiscussionItem title="Best resources for Web3?" tag="Tech" tagClass="bg-primary/10 text-primary" init="JD" time="2 hours ago" count="12" onClick={() => alert('Opening discussion: Best resources for Web3?...')} />
              <DiscussionItem title="Hostel mess food quality feedback" tag="Campus" tagClass="bg-[#f59e0b]/10 text-[#f59e0b]" init="AK" time="5 hours ago" count="45" onClick={() => alert('Opening discussion: Hostel mess food quality feedback...')} />
              <DiscussionItem title="Looking for a project partner" tag="Collab" tagClass="bg-[#10b981]/10 text-[#10b981]" init="SM" time="Yesterday" count="8" onClick={() => alert('Opening discussion: Looking for a project partner...')} />
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="mt-6 w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg p-[16px_24px] flex items-center justify-between">
        <div className="absolute -top-[30px] -right-[30px] w-[140px] h-[140px] bg-white opacity-[0.08] rounded-full pointer-events-none"></div>
        <div className="relative flex items-center space-x-[14px]">
          <div className="flex items-center justify-center">
            <Megaphone className="text-white w-6 h-6" />
          </div>
          <div className="flex items-center">
            <span className="text-white font-bold text-[13px] mr-1">Important Notice:</span>
            <span className="text-white/80 text-[13px]">Exam Form Submission Deadline – 20 May 2026</span>
          </div>
        </div>
        <Link to="/notices" className="relative bg-white/20 hover:bg-white/30 text-white font-semibold rounded-[12px] border border-white/20 transition-colors flex items-center px-4 py-2 text-[13px]">
          View Notice <ArrowUp className="w-3 h-3 rotate-45 ml-1" />
        </Link>
      </div>

    </div>
  );
}

function StatCard({ title, value, icon: Icon, colorClass, trend, trendUp, onClick }) {
  return (
    <div onClick={onClick} className="bg-surface-white p-5 rounded-xl border border-border-subtle shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)] flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <p className="font-label-md text-label-md text-text-muted">{title}</p>
        <div className={cn("p-1.5 rounded-lg", colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <h3 className="font-display-lg text-4xl font-bold text-on-surface">{value}</h3>
        {trend && (
          <span className={cn("font-label-sm text-label-sm flex items-center px-1.5 py-0.5 rounded", trendUp ? "text-[#10b981] bg-[#10b981]/10" : "text-error bg-error/10")}>
            {trendUp ? <ArrowUp className="w-3 h-3 mr-0.5" /> : null}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function ListItem({ icon, title, meta, onClick }) {
  const isPdf = icon === 'pdf';
  const isDoc = icon === 'doc';
  return (
    <li onClick={onClick} className="p-5 flex items-center hover:bg-surface-container-low transition-colors group cursor-pointer border-b border-border-subtle last:border-b-0">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mr-4", 
        isPdf ? "bg-error/10 text-error" : isDoc ? "bg-primary/10 text-primary" : "bg-[#10b981]/10 text-[#10b981]"
      )}>
        <FileText className="w-5 h-5 fill-current/20" />
      </div>
      <div className="flex-1">
        <p className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">{title}</p>
        <p className="font-body-sm text-body-sm text-text-muted">{meta}</p>
      </div>
    </li>
  );
}

function EventItem({ month, day, title, time, onClick }) {
  return (
    <div onClick={onClick} className="flex items-start p-2 rounded-lg -ml-2 cursor-pointer hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-[1px] transition-all duration-200">
      <div className="bg-surface-container border border-border-subtle rounded-lg p-2 text-center w-14 mr-4 flex-shrink-0">
        <div className="font-label-sm text-label-sm text-error uppercase">{month}</div>
        <div className="font-headline-md text-headline-md text-on-surface leading-tight">{day}</div>
      </div>
      <div className="flex-1 pt-1">
        <h4 className="font-label-md text-label-md text-on-surface">{title}</h4>
        <p className="font-body-sm text-body-sm text-text-muted flex items-center mt-1">
          <Clock className="w-3 h-3 mr-1" />
          {time}
        </p>
      </div>
    </div>
  );
}

function DriveItem({ init, title, meta, colorClass, onClick }) {
  return (
    <div onClick={onClick} className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mr-3", colorClass)}>
          {init}
        </div>
        <div>
          <p className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">{title}</p>
          <p className="font-body-sm text-body-sm text-text-muted">{meta}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
    </div>
  );
}

function DiscussionItem({ title, tag, tagClass, init, time, count, onClick }) {
  return (
    <li onClick={onClick} className="p-4 hover:bg-surface-container-low transition-colors cursor-pointer border-b border-border-subtle last:border-b-0">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-label-md text-label-md text-on-surface line-clamp-1">{title}</h4>
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ml-2", tagClass)}>{tag}</span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-2">
          <span className="w-5 h-5 rounded-full bg-surface-dim flex items-center justify-center text-[10px] font-bold text-on-surface-variant">{init}</span>
          <span className="font-body-sm text-body-sm text-text-muted text-xs">{time}</span>
        </div>
        <div className="flex items-center text-text-muted text-xs space-x-1">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{count}</span>
        </div>
      </div>
    </li>
  );
}

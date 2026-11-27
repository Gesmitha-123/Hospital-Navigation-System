import React, { useState, useEffect } from 'react';
import {
  Info,
  Building2,
  Stethoscope,
  Users,
  Search,
  Navigation,
  Clock,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import * as api from '../../services/api';

export default function AboutView() {
  const { navigateToLocation, allFloors, summaryStats } = useNavigation();
  const [doctors, setDoctors] = useState([]);
  const [searchDoc, setSearchDoc] = useState('');

  useEffect(() => {
    api.fetchDoctors()
      .then(setDoctors)
      .catch(console.error);
  }, []);

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(searchDoc.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(searchDoc.toLowerCase()) ||
    doc.department.toLowerCase().includes(searchDoc.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hospital Identity Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/90 flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-teal-500/10 border border-teal-500/20 text-teal-600 flex items-center justify-center font-black text-3xl shadow-inner flex-shrink-0">
          <Building2 className="w-10 h-10" />
        </div>
        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-teal-600" />
            <span>JCI Accredited Tertiary Care Center</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-hospital-navy">
            St. Jude Metro Memorial Hospital
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 max-w-3xl leading-relaxed">
            A state-of-the-art multi-specialty healthcare facility spanning three medical concourses. Providing advanced cardiology, neurology, acute trauma care, orthopedics, surgical suites, and computerized indoor wayfinding.
          </p>
        </div>
      </div>

      {/* Hospital Contact and Operational Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-2">
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>Visiting & OPD Hours</span>
          </div>
          <p className="text-slate-500">Outpatient: Mon - Sat 08:00 - 20:00</p>
          <p className="text-slate-500">Inpatient Visiting: 10:00 - 19:00 Daily</p>
          <p className="text-teal-700 font-bold">Emergency & Trauma: 24/7 Always Open</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-2">
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <Phone className="w-4 h-4 text-teal-600" />
            <span>Campus Contact Details</span>
          </div>
          <p className="text-slate-500">Main Reception: (555) 019-4800</p>
          <p className="text-slate-500">Appointments Desk: (555) 019-4822</p>
          <p className="text-red-600 font-bold">Emergency Trauma Bay: (555) 019-9911</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-2">
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600" />
            <span>Location & Accessibility</span>
          </div>
          <p className="text-slate-500">Central Medical Tower, Metro Health District</p>
          <p className="text-slate-500">Underground Patient Parking: Level B1-B2</p>
          <p className="text-emerald-700 font-bold">Wheelchair Ramps & Dual Elevators Active</p>
        </div>
      </div>

      {/* Medical Specialists & Doctors Directory */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/90 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-hospital-navy flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-teal-600" />
              <span>Medical Specialists & Consulting Doctors</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Search by doctor name or clinical specialty and navigate directly to their room.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchDoc}
              onChange={(e) => setSearchDoc(e.target.value)}
              placeholder="Search doctors or specialties..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5 text-teal-700" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {doc.available ? 'Available' : 'In Surgery'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-hospital-navy">{doc.name}</h3>
                  <div className="text-xs text-teal-700 font-semibold">{doc.specialty}</div>
                  <div className="text-[11px] text-slate-400">{doc.qualification}</div>
                </div>

                <div className="text-xs text-slate-600 pt-2 border-t border-slate-200/60 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doc.schedule}</span>
                </div>
              </div>

              {doc.room_id && (
                <button
                  onClick={() => navigateToLocation(doc.room_id)}
                  className="w-full py-2 bg-white hover:bg-teal-600 hover:text-white border border-slate-200 hover:border-teal-600 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate to Consultation Room</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


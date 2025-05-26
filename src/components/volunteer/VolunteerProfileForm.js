'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { X, Plus } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

export function VolunteerProfileForm({ profile, onSave, onCancel }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    skills: profile?.skills || [],
    availability: {
      days: profile?.availability?.days || [],
      timeSlots: profile?.availability?.timeSlots || [],
      hoursPerWeek: profile?.availability?.hoursPerWeek || ''
    },
    contactPreferences: {
      email: profile?.contactPreferences?.email !== false,
      phone: profile?.contactPreferences?.phone || false,
      preferredMethod: profile?.contactPreferences?.preferredMethod || 'email'
    },
    certificates: profile?.certificates || [],
    bio: profile?.bio || '',
    experience: profile?.experience || ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newCertificate, setNewCertificate] = useState('');

  const skillOptions = [
    'Teaching', 'Event Organization', 'Public Speaking', 'Administration',
    'Fundraising', 'Social Media', 'Graphic Design', 'Photography',
    'Translation', 'Counseling', 'Youth Mentoring', 'Community Outreach',
    'IT Support', 'Maintenance', 'Cooking', 'Cleaning', 'Security',
    'Medical/Healthcare', 'Legal Advice', 'Accounting', 'Construction'
  ];

  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlotOptions = ['Morning (6AM-12PM)', 'Afternoon (12PM-6PM)', 'Evening (6PM-10PM)', 'Night (10PM-6AM)'];

  const handleSkillAdd = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleCertificateAdd = () => {
    if (newCertificate.trim() && !formData.certificates.includes(newCertificate.trim())) {
      setFormData({
        ...formData,
        certificates: [...formData.certificates, newCertificate.trim()]
      });
      setNewCertificate('');
    }
  };

  const handleCertificateRemove = (certToRemove) => {
    setFormData({
      ...formData,
      certificates: formData.certificates.filter(cert => cert !== certToRemove)
    });
  };

  const handleDayToggle = (day) => {
    const newDays = formData.availability.days.includes(day)
      ? formData.availability.days.filter(d => d !== day)
      : [...formData.availability.days, day];
    
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        days: newDays
      }
    });
  };

  const handleTimeSlotToggle = (timeSlot) => {
    const newTimeSlots = formData.availability.timeSlots.includes(timeSlot)
      ? formData.availability.timeSlots.filter(ts => ts !== timeSlot)
      : [...formData.availability.timeSlots, timeSlot];
    
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        timeSlots: newTimeSlots
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put('/api/user/volunteer/profile', formData);
      toast({
        title: "Success",
        description: "Volunteer profile updated successfully"
      });
      onSave(formData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update volunteer profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Expertise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Skills</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleSkillRemove(skill)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                className="flex-1 border rounded-md px-3 py-2"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              >
                <option value="">Select a skill...</option>
                {skillOptions.filter(skill => !formData.skills.includes(skill)).map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <Button type="button" onClick={handleSkillAdd} disabled={!newSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2">
              <input
                type="text"
                placeholder="Or add custom skill..."
                className="w-full border rounded-md px-3 py-2"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd())}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Section */}
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Available Days</label>
            <div className="flex flex-wrap gap-2">
              {dayOptions.map(day => (
                <Button
                  key={day}
                  type="button"
                  variant={formData.availability.days.includes(day) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDayToggle(day)}
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Preferred Time Slots</label>
            <div className="space-y-2">
              {timeSlotOptions.map(timeSlot => (
                <label key={timeSlot} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.availability.timeSlots.includes(timeSlot)}
                    onChange={() => handleTimeSlotToggle(timeSlot)}
                    className="rounded"
                  />
                  <span className="text-sm">{timeSlot}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hours per week (optional)</label>
            <input
              type="number"
              min="1"
              max="40"
              className="w-full border rounded-md px-3 py-2"
              value={formData.availability.hoursPerWeek}
              onChange={(e) => setFormData({
                ...formData,
                availability: {
                  ...formData.availability,
                  hoursPerWeek: e.target.value
                }
              })}
              placeholder="e.g. 5"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">How can mosques contact you?</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.contactPreferences.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    contactPreferences: {
                      ...formData.contactPreferences,
                      email: e.target.checked
                    }
                  })}
                  className="rounded"
                />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.contactPreferences.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    contactPreferences: {
                      ...formData.contactPreferences,
                      phone: e.target.checked
                    }
                  })}
                  className="rounded"
                />
                <span className="text-sm">Phone</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preferred Contact Method</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={formData.contactPreferences.preferredMethod}
              onChange={(e) => setFormData({
                ...formData,
                contactPreferences: {
                  ...formData.contactPreferences,
                  preferredMethod: e.target.value
                }
              })}
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Section */}
      <Card>
        <CardHeader>
          <CardTitle>Certificates & Qualifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Certificates</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.certificates.map((cert, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {cert}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleCertificateRemove(cert)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add certificate or qualification..."
                className="flex-1 border rounded-md px-3 py-2"
                value={newCertificate}
                onChange={(e) => setNewCertificate(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCertificateAdd())}
              />
              <Button type="button" onClick={handleCertificateAdd} disabled={!newCertificate.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio and Experience */}
      <Card>
        <CardHeader>
          <CardTitle>About You</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 h-24"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Tell us about yourself and your motivation to volunteer..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Volunteer Experience</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 h-24"
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
              placeholder="Describe your previous volunteer experience..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}
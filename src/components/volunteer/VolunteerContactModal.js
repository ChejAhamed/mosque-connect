"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  SendIcon,
  UserIcon,
  BuildingIcon
} from "lucide-react";

export default function VolunteerContactModal({ 
  isOpen, 
  onClose, 
  volunteer, 
  currentUser,
  type = "application" // "application" or "offer"
}) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [messageData, setMessageData] = useState({
    subject: "",
    message: "",
    senderName: currentUser?.name || "",
    senderEmail: currentUser?.email || "",
    senderPhone: ""
  });

  const handleSendMessage = async () => {
    if (!messageData.subject || !messageData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in the subject and message fields.",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      // Here you would implement the actual contact functionality
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${volunteer?.userId?.name || volunteer?.name}.`,
      });
      
      onClose();
      setMessageData({
        subject: "",
        message: "",
        senderName: currentUser?.name || "",
        senderEmail: currentUser?.email || "",
        senderPhone: ""
      });
    } catch (error) {
      toast({
        title: "Failed to Send",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  if (!volunteer) return null;

  const volunteerName = volunteer.userId?.name || volunteer.name;
  const volunteerEmail = volunteer.contactInfo?.email || volunteer.userId?.email || volunteer.email;
  const volunteerPhone = volunteer.contactInfo?.phone || volunteer.phone;
  const volunteerCity = volunteer.userId?.city || volunteer.city;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MailIcon className="h-5 w-5 mr-2" />
            Contact {type === "application" ? "Volunteer Applicant" : "Volunteer"}
          </DialogTitle>
          <DialogDescription>
            Send a message to {volunteerName} regarding their volunteer {type}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Volunteer Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center">
              <UserIcon className="h-4 w-4 mr-2" />
              Volunteer Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">{volunteerName}</p>
                <div className="space-y-1 mt-2 text-sm">
                  <div className="flex items-center">
                    <MailIcon className="h-3 w-3 mr-2 text-gray-400" />
                    {volunteerEmail}
                  </div>
                  {volunteerPhone && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-3 w-3 mr-2 text-gray-400" />
                      {volunteerPhone}
                    </div>
                  )}
                  {volunteerCity && (
                    <div className="flex items-center">
                      <MapPinIcon className="h-3 w-3 mr-2 text-gray-400" />
                      {volunteerCity}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">
                  {type === "application" ? "Application:" : "Offering:"}
                </p>
                <p className="text-sm text-gray-700">{volunteer.title}</p>
                {volunteer.category && (
                  <Badge variant="outline" className="mt-2">
                    {volunteer.category}
                  </Badge>
                )}
                {type === "application" && volunteer.mosqueId && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <BuildingIcon className="h-3 w-3 mr-1" />
                    {volunteer.mosqueId.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          {volunteer.skillsOffered?.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Skills Offered</h4>
              <div className="flex flex-wrap gap-1">
                {volunteer.skillsOffered.map(skill => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Contact Form */}
          <div className="space-y-4">
            <h4 className="font-medium">Send Message</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="senderName">Your Name</Label>
                <Input
                  id="senderName"
                  value={messageData.senderName}
                  onChange={(e) => setMessageData({...messageData, senderName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="senderEmail">Your Email</Label>
                <Input
                  id="senderEmail"
                  type="email"
                  value={messageData.senderEmail}
                  onChange={(e) => setMessageData({...messageData, senderEmail: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="senderPhone">Your Phone (Optional)</Label>
              <Input
                id="senderPhone"
                type="tel"
                value={messageData.senderPhone}
                onChange={(e) => setMessageData({...messageData, senderPhone: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder={`Re: ${volunteer.title}`}
                value={messageData.subject}
                onChange={(e) => setMessageData({...messageData, subject: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Write your message here..."
                value={messageData.message}
                onChange={(e) => setMessageData({...messageData, message: e.target.value})}
                rows={5}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={handleSendMessage} 
              disabled={sending}
              className="flex-1"
            >
              <SendIcon className="h-4 w-4 mr-2" />
              {sending ? "Sending..." : "Send Message"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
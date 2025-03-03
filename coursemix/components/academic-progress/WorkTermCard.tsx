"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  markWorkTermCompletedAction, 
  updateWorkTermCompanyAction,
  deleteWorkTermAction,
  toggleWorkTermCompletedAction
} from "@/app/academic-progress-actions";
import { useRouter } from "next/navigation";
import { Edit, Check, X } from "lucide-react";

interface WorkTermCardProps {
  termName: string;
  userId: string;
  workTermId?: string;
  status?: string;
  companyName?: string;
  isScieWorkshop?: boolean;
}

export default function WorkTermCard({
  termName,
  userId,
  workTermId,
  status,
  companyName,
  isScieWorkshop = false,
}: WorkTermCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(status === "completed");
  const [company, setCompany] = useState(companyName || "");
  const router = useRouter();
  
  // Update local state when props change
  useEffect(() => {
    setIsCompleted(status === "completed");
    setCompany(companyName || "");
  }, [status, companyName]);

  const handleToggleCompleted = async () => {
    setIsSubmitting(true);
    
    try {
      // If currently completed, remove the entry entirely when toggling
      if (isCompleted && workTermId) {
        const result = await deleteWorkTermAction(workTermId, userId);
        
        if ('error' in result && result.error) {
          toast.error(result.error);
        } else {
          toast.success("Work term removed");
          router.refresh();
        }
      } else {
        // If not completed, mark as complete
        const result = await toggleWorkTermCompletedAction(termName, userId, workTermId);
        
        if ('error' in result && result.error) {
          toast.error(result.error);
        } else {
          setIsCompleted(true);
          toast.success("Work term marked as completed");
          router.refresh();
        }
      }
    } catch (error) {
      toast.error("Failed to update work term status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCompany = async () => {
    if (!company.trim()) {
      toast.error("Company name cannot be empty");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await updateWorkTermCompanyAction(termName, userId, company, workTermId);
      
      if ('error' in result && result.error) {
        toast.error(result.error);
      } else {
        setIsEditing(false);
        toast.success("Company name updated");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to update company name");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = () => {
    if (isCompleted) return "border-green-400 bg-green-50/80";
    return "border-gray-200 bg-white";
  };

  return (
    <div className={`rounded-lg shadow-sm p-4 border ${getStatusColor()} transition-all hover:shadow-md group`}>
      <div className="flex flex-col h-full min-h-[120px]">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <h3 className="font-bold text-gray-800">{termName}</h3>
            </div>
            
            {!isScieWorkshop && (
              <div className="text-sm text-gray-600 flex items-center gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Company name"
                      className="h-7 text-xs w-32"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleUpdateCompany}
                      disabled={isSubmitting}
                      className="h-5 w-5 text-green-600 hover:bg-green-100 p-0.5 rounded-full"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setIsEditing(false);
                        setCompany(companyName || "");
                      }}
                      className="h-5 w-5 text-red-600 hover:bg-red-100 p-0.5 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span>{company || "No company specified"}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      className="h-5 w-5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-0.5 rounded-full opacity-80 hover:opacity-100"
                      title="Edit Company"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={handleToggleCompleted}
              className={`text-xs h-7 ${isCompleted 
                ? "bg-green-50 border-green-500 text-green-600 hover:bg-white hover:text-green-700" 
                : "bg-white hover:bg-green-50 border-green-500 text-green-600 hover:text-green-700"}`}
            >
              {isCompleted ? "Undo Complete" : "Mark Complete"}
            </Button>
          </div>
        </div>
        
        <div className="mt-auto pt-2">
          <div className="text-xs text-gray-500 mt-1">
            {isScieWorkshop ? (
              "Required co-op preparation"
            ) : (
              "Co-op work term"
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
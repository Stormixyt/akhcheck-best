import { useState } from "react";
import { BookOpen, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Message {
  id: string;
  group_id: string;
  user_id: string;
  message: string | null;
  type: string;
  metadata: any;
  image_url: string | null;
  created_at: string;
  edited_at?: string | null;
  deleted_for_everyone?: boolean;
  deleted_for_user?: string[];
  profiles: {
    display_name: string;
  };
}

interface ChatMessageProps {
  message: Message;
  currentUserId: string;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string, deleteType: 'self' | 'everyone') => void;
}

export const ChatMessage = ({ message, currentUserId, onEdit, onDelete }: ChatMessageProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.message || "");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const isOwnMessage = message.user_id === currentUserId;
  const isDeleted = message.deleted_for_everyone || message.deleted_for_user?.includes(currentUserId);

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.message) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = (deleteType: 'self' | 'everyone') => {
    onDelete(message.id, deleteType);
    setShowDeleteDialog(false);
  };

  if (isDeleted) {
    return (
      <div className="flex justify-center my-2">
        <div className="text-xs text-muted-foreground italic px-3 py-1 rounded-full bg-muted/30">
          Message deleted
        </div>
      </div>
    );
  }

  if (message.type === 'verse') {
    return (
      <div className="flex justify-center my-4">
        <GlassCard className="max-w-[85%] p-6 border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
          <div className="text-center space-y-3">
            <BookOpen className="w-6 h-6 text-accent mx-auto" />
            <div className="text-lg font-arabic text-foreground leading-relaxed" dir="rtl">
              {message.metadata.arabic}
            </div>
            <div className="text-sm text-muted-foreground italic leading-relaxed">
              "{message.metadata.translation}"
            </div>
            <div className="text-xs text-accent font-semibold">
              — {message.metadata.reference}
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className={`flex items-end space-x-2 mb-3 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar placeholder for other users */}
      {!isOwnMessage && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-semibold text-foreground mb-1">
          {message.profiles?.display_name?.charAt(0) || 'A'}
        </div>
      )}
      
      <div className={`group max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Message bubble */}
        <div className="relative">
          <div className={`px-4 py-3 rounded-3xl ${
            isOwnMessage 
              ? 'bg-primary text-primary-foreground rounded-br-lg' 
              : 'bg-card text-card-foreground rounded-bl-lg border border-border/50'
          } shadow-sm`}>
            
            {/* User name for others */}
            {!isOwnMessage && (
              <div className="text-xs text-muted-foreground mb-1 font-medium">
                {message.profiles?.display_name}
              </div>
            )}
            
            {/* Message content */}
            {message.type === 'image' ? (
              message.image_url && (
                <img
                  src={message.image_url}
                  alt="Shared image"
                  className="max-w-full h-auto rounded-2xl cursor-pointer"
                  onClick={() => window.open(message.image_url!, '_blank')}
                />
              )
            ) : (
              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
                      className="bg-background/50 border-border/50"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleEdit} className="h-7 text-xs">Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="h-7 text-xs">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className={`text-sm ${message.type === 'system' ? 'italic' : ''}`}>
                    {message.message}
                    {message.edited_at && (
                      <span className="text-xs text-muted-foreground ml-2">(edited)</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Options button for own messages */}
          {isOwnMessage && !isEditing && (
            <Popover open={showOptions} onOpenChange={setShowOptions}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0 hover:bg-muted/80"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1" align="start">
                <div className="space-y-1">
                  {message.type === 'text' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-8 text-xs"
                      onClick={() => {
                        setIsEditing(true);
                        setShowOptions(false);
                      }}
                    >
                      <Edit className="w-3 h-3 mr-2" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 text-xs text-destructive hover:text-destructive"
                    onClick={() => {
                      setShowDeleteDialog(true);
                      setShowOptions(false);
                    }}
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-muted-foreground mt-1 px-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              How would you like to delete this message?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col space-y-2 sm:flex-col sm:space-x-0">
            <AlertDialogAction
              onClick={() => handleDelete('everyone')}
              className="bg-destructive hover:bg-destructive/80 text-destructive-foreground"
            >
              Delete for Everyone
            </AlertDialogAction>
            <Button
              onClick={() => handleDelete('self')}
              variant="outline"
              className="w-full"
            >
              Delete for Me
            </Button>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
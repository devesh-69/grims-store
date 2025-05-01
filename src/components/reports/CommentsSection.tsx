
import { useState, useRef } from "react";
import { ReportComment } from "@/types/report";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistance } from "date-fns";
import { MessageSquare, Reply, User } from "lucide-react";

interface CommentsSectionProps {
  comments: ReportComment[];
  onAddComment: (content: string, parentId?: string) => void;
}

export function CommentsSection({ comments, onAddComment }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment("");
  };
  
  const handleReply = (commentId: string) => {
    if (!replyContent.trim()) return;
    onAddComment(replyContent, commentId);
    setReplyContent("");
    setReplyTo(null);
  };

  const renderComment = (comment: ReportComment, isReply = false) => {
    const initials = comment.user?.first_name && comment.user?.last_name
      ? `${comment.user.first_name[0]}${comment.user.last_name[0]}`
      : "U";

    const formattedDate = formatDistance(
      new Date(comment.created_at),
      new Date(),
      { addSuffix: true }
    );
    
    return (
      <div 
        key={comment.id} 
        className={`${isReply ? 'ml-12 mt-3' : 'mb-4'}`}
      >
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            {comment.user?.avatar_url ? (
              <AvatarImage src={comment.user.avatar_url} alt="User" />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="font-medium">
                {comment.user?.first_name && comment.user?.last_name
                  ? `${comment.user.first_name} ${comment.user.last_name}`
                  : "Unknown User"}
              </div>
              <div className="text-xs text-muted-foreground">{formattedDate}</div>
            </div>
            
            <div className="text-sm">{comment.content}</div>
            
            <div className="pt-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setReplyTo(comment.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            </div>
            
            {replyTo === comment.id && (
              <div className="mt-2 space-y-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px] focus-visible:ring-primary"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setReplyTo(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleReply(comment.id)}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3 mt-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map(comment => renderComment(comment))}
        </div>
      ) : (
        <Card className="border-dashed text-center">
          <CardContent className="pt-6 pb-4">
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No comments yet</p>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-4 pt-4 border-t">
        <h3 className="font-medium mb-2">Add Comment</h3>
        <Textarea
          ref={textareaRef}
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px] focus-visible:ring-primary"
        />
        <div className="flex justify-end mt-2">
          <Button onClick={handleAddComment}>
            Post Comment
          </Button>
        </div>
      </div>
    </div>
  );
}

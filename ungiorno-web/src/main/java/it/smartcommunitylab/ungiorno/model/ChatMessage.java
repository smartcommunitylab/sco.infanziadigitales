package it.smartcommunitylab.ungiorno.model;

public class ChatMessage extends SchoolObject {
	public static final String SENT_BY_TEACHER = "teacher";
	public static final String SENT_BY_PARENT = "parent";
	
	private String messageId;
	private String kidId;
	private String teacherId;
	private String sender;
	private long creationDate;
	private boolean received;
	private boolean seen;
	private String text;
	
	public String getMessageId() {
		return messageId;
	}
	public void setMessageId(String messageId) {
		this.messageId = messageId;
	}
	public String getKidId() {
		return kidId;
	}
	public void setKidId(String kidId) {
		this.kidId = kidId;
	}
	public String getTeacherId() {
		return teacherId;
	}
	public void setTeacherId(String teacherId) {
		this.teacherId = teacherId;
	}
	public String getSender() {
		return sender;
	}
	public void setSender(String sender) {
		this.sender = sender;
	}
	public long getCreationDate() {
		return creationDate;
	}
	public void setCreationDate(long creationDate) {
		this.creationDate = creationDate;
	}
	public boolean isReceived() {
		return received;
	}
	public void setReceived(boolean received) {
		this.received = received;
	}
	public boolean isSeen() {
		return seen;
	}
	public void setSeen(boolean seen) {
		this.seen = seen;
	}
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	
	
	
}

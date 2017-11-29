package it.smartcommunitylab.ungiorno.usage;


public class UsageEntity implements Comparable<UsageEntity> {

	private long timestamp;

	public enum UsageAction {
		COMMUNICATION, MESSAGE_TO_PARENT, MESSAGE_TO_TEACHER, 
		APP_START, CALL, 
		DAILY_PLAN, WEEKLY_PLAN, DEFAULT_PLAN, DEFAULT_USAGE, PREVIOUS_WEEK_USAGE,
		NOTIFICATION_SETUP
	};

	private String fromId;
	private String toId;
	private String kidId;
	
	private UsageAction action;

	private String appId;
	private String schoolId;
	
	private Object extra;

	public UsageEntity() {
	}

	public UsageEntity(String fromId, String toId, String kidId, UsageAction action, Object extra, String appId, String schoolId) {
		super();
		this.fromId = fromId;
		this.toId = toId;
		this.kidId = kidId;
		this.action = action;
		this.extra = extra;
		this.appId = appId;
		this.schoolId = schoolId;
		this.timestamp = System.currentTimeMillis();
	}

	public String getKidId() {
		return kidId;
	}

	public void setKidId(String kidId) {
		this.kidId = kidId;
	}

	public String getAppId() {
		return appId;
	}

	public void setAppId(String appId) {
		this.appId = appId;
	}

	public String getSchoolId() {
		return schoolId;
	}

	public void setSchoolId(String schoolId) {
		this.schoolId = schoolId;
	}

	public long getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(long timestamp) {
		this.timestamp = timestamp;
	}

	public String getFromId() {
		return fromId;
	}

	public void setFromId(String fromId) {
		this.fromId = fromId;
	}

	public String getToId() {
		return toId;
	}

	public void setToId(String toId) {
		this.toId = toId;
	}

	public UsageAction getAction() {
		return action;
	}

	public void setAction(UsageAction action) {
		this.action = action;
	}

	public Object getExtra() {
		return extra;
	}

	public void setExtra(Object extra) {
		this.extra = extra;
	}

	@Override
	public int compareTo(UsageEntity o) {
		return (int)((timestamp - o.timestamp) / 1000L);
	}

}

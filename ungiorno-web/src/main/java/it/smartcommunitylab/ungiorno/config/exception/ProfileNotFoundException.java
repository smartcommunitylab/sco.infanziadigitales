package it.smartcommunitylab.ungiorno.config.exception;

public class ProfileNotFoundException extends Exception {
	private static final long serialVersionUID = -7370003107228238616L;

	public ProfileNotFoundException(String message) {
		super(message);
	}
	
	public ProfileNotFoundException() {
		super();
	}

}

package it.smartcommunitylab.ungiorno.controller;

import it.smartcommunitylab.ungiorno.config.exception.ProfileNotFoundException;
import it.smartcommunitylab.ungiorno.model.ChatMessage;
import it.smartcommunitylab.ungiorno.storage.RepositoryManager;
import it.smartcommunitylab.ungiorno.utils.PermissionsManager;
import it.smartcommunitylab.ungiorno.utils.Utils;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

@Controller
public class ChatController {
	private static final transient Logger logger = LoggerFactory.getLogger(ChatController.class);
	
	@Autowired
	private RepositoryManager storage;

	@Autowired
	private PermissionsManager permissions;
	
	@RequestMapping(method=RequestMethod.GET, value="/chat/{appId}/{schoolId}/message/{kidId}")
	public @ResponseBody List<ChatMessage> getMessages(@PathVariable String appId, @PathVariable String schoolId,
			@PathVariable String kidId, HttpServletRequest request) {
		List<ChatMessage> result = new ArrayList<ChatMessage>();
		long timestamp = 0;
		int limit = 10;
		if(Utils.isNotEmpty(request.getParameter("timestamp"))) {
			try {
				timestamp = Long.valueOf(request.getParameter("timestamp"));
			} catch (Exception e) {
			}
		}
		if(Utils.isNotEmpty(request.getParameter("limit"))) {
			try {
				limit = Integer.valueOf(request.getParameter("limit"));
			} catch (Exception e) {
			}
		}
		result = storage.getChatMessages(appId, schoolId, kidId, timestamp, limit);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getMessages[%s]: %s - %s - %d", appId, schoolId, kidId, result.size()));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.POST, value="/chat/{appId}/{schoolId}/message/fromparent")
	public @ResponseBody ChatMessage sendMessageToTeacher(@PathVariable String appId, @PathVariable String schoolId,
			@RequestBody String json) throws Exception {
		ChatMessage result = null;
		ChatMessage message = new ChatMessage();
		JsonNode rootNode = Utils.readJsonFromString(json);
		String kidId = rootNode.get("kidId").asText();
		String text = rootNode.get("text").asText();
		message.setAppId(appId);
		message.setSchoolId(schoolId);
		message.setCreationDate(System.currentTimeMillis());
		message.setKidId(kidId);
		message.setText(text);
		message.setSender(ChatMessage.SENT_BY_PARENT);
		result = storage.saveChatMessage(message);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("sendMessageToTeacher[%s]: %s - %s", appId, schoolId, kidId));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.POST, value="/chat/{appId}/{schoolId}/message/fromteacher")
	public @ResponseBody ChatMessage sendMessageToParent(@PathVariable String appId, @PathVariable String schoolId,
			@RequestBody String json) throws Exception {
		ChatMessage result = null;
		ChatMessage message = new ChatMessage();
		JsonNode rootNode = Utils.readJsonFromString(json);
		String kidId = rootNode.get("kidId").asText();
		String teacherId = rootNode.get("teacherId").asText();
		String text = rootNode.get("text").asText();
		message.setAppId(appId);
		message.setSchoolId(schoolId);
		message.setCreationDate(System.currentTimeMillis());
		message.setKidId(kidId);
		message.setTeacherId(teacherId);
		message.setText(text);
		message.setSender(ChatMessage.SENT_BY_TEACHER);
		result = storage.saveChatMessage(message);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("sendMessageToParent[%s]: %s - %s - %s", appId, schoolId, kidId, teacherId));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.POST, value="/chat/{appId}/{schoolId}/messages")
	public @ResponseBody List<ChatMessage> sendMessages(@PathVariable String appId, @PathVariable String schoolId,
			@RequestBody String json) throws Exception {
		List<ChatMessage> result = new ArrayList<ChatMessage>();
		JsonNode rootNode = Utils.readJsonFromString(json);
		String teacherId = rootNode.get("teacherId").asText();
		String text = rootNode.get("text").asText();
		ArrayNode arrayNode = (ArrayNode) rootNode.get("recipients");
		List<String> recipients = new ArrayList<String>();
		for(JsonNode node : arrayNode) {
			recipients.add(node.asText());
		}
		long now = System.currentTimeMillis();
		for(String kidId : recipients) {
			ChatMessage message = new ChatMessage();
			message.setAppId(appId);
			message.setSchoolId(schoolId);
			message.setCreationDate(now);
			message.setKidId(kidId);
			message.setTeacherId(teacherId);
			message.setSender(ChatMessage.SENT_BY_TEACHER);
			message.setText(text);
			ChatMessage dbMessage = storage.saveChatMessage(message);
			result.add(dbMessage);
		}
		if(logger.isInfoEnabled()) {
			logger.info(String.format("sendMessage[%s]: %s - %s - %s", appId, schoolId, teacherId, recipients.toString()));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.PUT, value="/chat/{appId}/{schoolId}/message")
	public @ResponseBody ChatMessage updateMessage(@PathVariable String appId, @PathVariable String schoolId,
			@RequestBody ChatMessage message) {
		ChatMessage result = null;
		if((message != null) && (Utils.isNotEmpty(message.getMessageId()))) {
			message.setAppId(appId);
			message.setSchoolId(schoolId);
			result = storage.updateChatMessage(message);
			if(logger.isInfoEnabled()) {
				logger.info(String.format("updateMessage[%s]: %s - %s", appId, schoolId, message.getMessageId()));
			}
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.DELETE, value="/chat/{appId}/{schoolId}/message/{messageId}")
	public @ResponseBody ChatMessage removeMessage(@PathVariable String appId, @PathVariable String schoolId,
			@PathVariable String messageId) {
		ChatMessage result = null;
		result = storage.removeChatMessage(appId, schoolId, messageId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("removeMessage[%s]: %s - %s", appId, schoolId, messageId));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.GET, value="/chat/{appId}/{schoolId}/message/{messageId}/received")
	public @ResponseBody ChatMessage receivedMessage(@PathVariable String appId, @PathVariable String schoolId,
			@PathVariable String messageId) {
		ChatMessage result = null;
		result = storage.chatMessageReceived(appId, schoolId, messageId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("receivedMessage[%s]: %s - %s", appId, schoolId, messageId));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.GET, value="/chat/{appId}/{schoolId}/message/{messageId}/seen")
	public @ResponseBody ChatMessage seenMessage(@PathVariable String appId, @PathVariable String schoolId,
			@PathVariable String messageId) {
		ChatMessage result = null;
		result = storage.chatMessageSeen(appId, schoolId, messageId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("seenMessage[%s]: %s - %s", appId, schoolId, messageId));
		}
		return result;
	}
	
	@ExceptionHandler(Exception.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public String handleError(HttpServletRequest request, Exception exception) {
		return "{\"error\":\"" + exception.getMessage() + "\"}";
	}
	
	@ExceptionHandler(ProfileNotFoundException.class)
	@ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
	@ResponseBody
	public String handleProfileNotFoundError(HttpServletRequest request, Exception exception) {
		return "{\"error\":\"" + exception.getMessage() + "\"}";
	}
}

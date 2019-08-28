package it.smartcommunitylab.ungiorno.controller;


import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

import it.smartcommunitylab.ungiorno.config.exception.ProfileNotFoundException;
import it.smartcommunitylab.ungiorno.model.Author;
import it.smartcommunitylab.ungiorno.model.ChatMessage;
import it.smartcommunitylab.ungiorno.model.Response;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageAction;
import it.smartcommunitylab.ungiorno.usage.UsageManager;
import it.smartcommunitylab.ungiorno.utils.NotificationManager;
import it.smartcommunitylab.ungiorno.utils.PermissionsManager;
import it.smartcommunitylab.ungiorno.utils.Utils;

@Controller
public class ChatController {
    private static final transient Logger logger = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private RepositoryService storage;

    @Autowired
    private PermissionsManager permissions;
    @Autowired
    private NotificationManager notificationManager;
    @Autowired
    private UsageManager usageManager;

    @RequestMapping(method = RequestMethod.GET, value = "/chat/{appId}/{schoolId}/message/{kidId}")
    public @ResponseBody List<ChatMessage> getMessages(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId,
            @RequestParam(required = false) Long timestamp,
            @RequestParam(required = false) Integer limit) {
    	
        if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
            throw new SecurityException("User has no access to kid data");
        }
    	
        List<ChatMessage> result = new ArrayList<ChatMessage>();
        if (timestamp == null) {
            timestamp = 0L;
        }
        if (limit == null) {
            limit = 10;
        }
        result = storage.getChatMessages(appId, schoolId, kidId, timestamp, limit);
        if (logger.isInfoEnabled()) {
            logger.info(String.format("getMessages[%s]: %s - %s - %d", appId, schoolId, kidId,
                    result.size()));
        }
        return result;
    }

    @RequestMapping(method = RequestMethod.GET,
            value = "/chat/{appId}/{schoolId}/message/{kidId}/unread/fromparent")
    public @ResponseBody Long getUnreadCountFromParent(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId) {
    	
        if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
            throw new SecurityException("User has no access to kid data");
        }
    	
        Long result = storage.getUnreadChatMessageCount(appId, schoolId, kidId,
                ChatMessage.SENT_BY_PARENT);
        if (logger.isInfoEnabled()) {
            logger.info(String.format("getUnreadCountFromParent[%s]: %s - %s - %d", appId, schoolId,
                    kidId, result));
        }
        return result;
    }

    @RequestMapping(method = RequestMethod.GET,
            value = "/chat/{appId}/{schoolId}/message/unread/fromparent")
    public @ResponseBody Map<String, Map<String, Integer>> getAllUnreadCountFromParent(
            @PathVariable String appId, @PathVariable String schoolId) {
    	
        if (!permissions.isSchoolTeacher(appId, schoolId, permissions.getUserId())) {
            throw new SecurityException("User has no access to kid data");
        }
    	
        Map<String, Map<String, Integer>> result =
                storage.getAllUnreadChatMessageCount(appId, schoolId, ChatMessage.SENT_BY_PARENT);
        if (logger.isInfoEnabled()) {
            logger.info(String.format("getAllUnreadCountFromParent[%s]: %s", appId, schoolId));
        }
        return result;
    }

    @RequestMapping(method = RequestMethod.GET,
            value = "/chat/{appId}/{schoolId}/message/{kidId}/unread/fromteacher")
    public @ResponseBody Long getUnreadCountFromTeacher(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId) {

        if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
            throw new SecurityException("User has no access to kid data");
        }

    	Long result = storage.getUnreadChatMessageCount(appId, schoolId, kidId,
                ChatMessage.SENT_BY_TEACHER);
        if (logger.isInfoEnabled()) {
            logger.info(String.format("getUnreadCountFromTeacher[%s]: %s - %s - %d", appId,
                    schoolId, kidId, result));
        }
        return result;
    }

    @RequestMapping(method = RequestMethod.POST,
            value = "/chat/{appId}/{schoolId}/message/fromparent")
    public @ResponseBody ChatMessage sendMessageToTeacher(@PathVariable String appId,
            @PathVariable String schoolId, @RequestBody ChatMessage data) throws Exception {
        ChatMessage result = null;
        // ChatMessage message = new ChatMessage();
        // JsonNode rootNode = Utils.readJsonFromString(json);
        // String kidId = rootNode.get("kidId").asText();
        // String text = rootNode.get("text").asText();
        if (!permissions.checkKidProfile(appId, schoolId, data.getKidId(), false)) {
            throw new SecurityException("User has no rights to send message for kid");
        }
        
        
        String kidId = data.getKidId();
        String text = data.getText();
        data.setAppId(appId);
        data.setSchoolId(schoolId);
        data.setCreationDate(System.currentTimeMillis());
        // message.setKidId(kidId);
        // message.setText(text);
        data.setSender(ChatMessage.SENT_BY_PARENT);
        data.setAuthor(storage.getTeacherAsParent(appId, schoolId, permissions.getUserId()));

        result = storage.saveChatMessage(data);
        notificationManager.sendDirectMessageToSchool(appId, schoolId, kidId, data.getAuthor(),
                text, result.getMessageId());
        if (logger.isInfoEnabled()) {
            logger.info(String.format("sendMessageToTeacher[%s]: %s - %s", appId, schoolId, kidId));
        }

        usageManager.messageSent(appId, schoolId, permissions.getUserId(), null, kidId, UsageAction.MESSAGE_TO_TEACHER);

        return result;
    }

    @RequestMapping(method = RequestMethod.POST,
            value = "/chat/{appId}/{schoolId}/message/fromteacher")
    public @ResponseBody ChatMessage sendMessageToParent(@PathVariable String appId,
            @PathVariable String schoolId, @RequestBody ChatMessage data) throws Exception {
        ChatMessage result = null;
        // ChatMessage message = new ChatMessage();
        // JsonNode rootNode = Utils.readJsonFromString(json);
        // String kidId = rootNode.get("kidId").asText();
        // String teacherId = rootNode.get("teacherId").asText();
        // String text = rootNode.get("text").asText();
        
        if (!permissions.checkKidProfile(appId, schoolId, data.getKidId(), true)) {
            throw new SecurityException("Teacher has no rights to send message for kid");
        }
        
        String kidId = data.getKidId();
        String text = data.getText();
        String teacherId = data.getTeacherId();
        data.setAppId(appId);
        data.setSchoolId(schoolId);
        data.setCreationDate(System.currentTimeMillis());
        data.setKidId(kidId);
        data.setTeacherId(teacherId);
        data.setText(text);
        data.setSender(ChatMessage.SENT_BY_TEACHER);
        data.setAuthor(storage.getTeacherAsAuthor(appId, schoolId, teacherId));
        result = storage.saveChatMessage(data);

        notificationManager.sendDirectMessageToParents(appId, schoolId, kidId, teacherId,
                data.getAuthor(), text, result.getMessageId());

        if (logger.isInfoEnabled()) {
            logger.info(String.format("sendMessageToParent[%s]: %s - %s - %s", appId, schoolId,
                    kidId, teacherId));
        }

        usageManager.messageSent(appId, schoolId, teacherId, null, kidId, UsageAction.MESSAGE_TO_PARENT);

        return result;
    }

    @RequestMapping(method = RequestMethod.POST, value = "/chat/{appId}/{schoolId}/messages")
    public @ResponseBody List<ChatMessage> sendMessages(@PathVariable String appId,
            @PathVariable String schoolId, @RequestBody String json) throws Exception {
        List<ChatMessage> result = new ArrayList<ChatMessage>();
        JsonNode rootNode = Utils.readJsonFromString(json);
        String teacherId = rootNode.get("teacherId").asText();
        String text = rootNode.get("text").asText();
        ArrayNode arrayNode = (ArrayNode) rootNode.get("recipients");
        
        if (!permissions.isSchoolTeacher(appId, schoolId, teacherId)) {
            throw new SecurityException("User has no rights to send message for school");
        }

        List<String> recipients = new ArrayList<String>();
        for (JsonNode node : arrayNode) {
            recipients.add(node.asText());
        }
        long now = System.currentTimeMillis();
        Author teacher = storage.getTeacherAsAuthor(appId, schoolId, teacherId);
        for (String kidId : recipients) {
            ChatMessage message = new ChatMessage();
            message.setAppId(appId);
            message.setSchoolId(schoolId);
            message.setCreationDate(now);
            message.setKidId(kidId);
            message.setTeacherId(teacherId);
            message.setSender(ChatMessage.SENT_BY_TEACHER);
            message.setText(text);
            message.setAuthor(teacher);
            ChatMessage dbMessage = storage.saveChatMessage(message);
            notificationManager.sendDirectMessageToParents(appId, schoolId, kidId, teacherId,
                    message.getAuthor(), text, dbMessage.getMessageId());
            result.add(dbMessage);
        }
        if (logger.isInfoEnabled()) {
            logger.info(String.format("sendMessage[%s]: %s - %s - %s", appId, schoolId, teacherId,
                    recipients.toString()));
        }

        // usageManager.messageSent(appId, schoolId, teacherId, null, UsageActor.TEACHER,
        // UsageActor.PARENT, true);

        return result;
    }

    @RequestMapping(method = RequestMethod.PUT, value = "/chat/{appId}/{schoolId}/message")
    public @ResponseBody ChatMessage updateMessage(@PathVariable String appId,
            @PathVariable String schoolId, @RequestBody ChatMessage message) {
        ChatMessage result = null;
        if ((message != null) && (Utils.isNotEmpty(message.getMessageId()))) {
            if (!permissions.checkKidProfile(appId, schoolId, message.getKidId(), null)) {
                throw new SecurityException("User has no access to kid data");
            }
        	
            message.setAppId(appId);
            message.setSchoolId(schoolId);
            result = storage.updateChatMessage(message);
            if (logger.isInfoEnabled()) {
                logger.info(String.format("updateMessage[%s]: %s - %s", appId, schoolId,
                        message.getMessageId()));
            }
        }
        return result;
    }

    @RequestMapping(method = RequestMethod.DELETE,
            value = "/chat/{appId}/{schoolId}/message/{messageId}")
    public @ResponseBody ChatMessage removeMessage(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String messageId) {
        ChatMessage result = null;
        ChatMessage chatMessage = storage.getChatMessage(appId, schoolId, messageId);
        if (!permissions.checkKidProfile(appId, schoolId, chatMessage.getKidId(), null)) {
            throw new SecurityException("User has no access to kid data");
        }
        
        result = storage.removeChatMessage(appId, schoolId, messageId);
        if (logger.isInfoEnabled()) {
            logger.info(String.format("removeMessage[%s]: %s - %s", appId, schoolId, messageId));
        }
        return result;
    }

    @RequestMapping(method = RequestMethod.PUT,
            value = "/chat/{appId}/{schoolId}/message/{messageId}/received")
    public @ResponseBody ChatMessage receivedMessage(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String messageId) {
    	
        ChatMessage chatMessage = storage.getChatMessage(appId, schoolId, messageId);
        if (!permissions.checkKidProfile(appId, schoolId, chatMessage.getKidId(), null)) {
            throw new SecurityException("User has no access to kid data");
        }
    	
        ChatMessage result = null;
        result = storage.chatMessageReceived(appId, schoolId, messageId);
        if (logger.isInfoEnabled()) {
            logger.info(String.format("receivedMessage[%s]: %s - %s", appId, schoolId, messageId));
        }
        if (ChatMessage.SENT_BY_TEACHER.equals(result.getSender())) {
            notificationManager.notifyMessageStatusByParent(appId, schoolId, result.getKidId(),
                    messageId, "received");
        } else {
            notificationManager.notifyMessageStatusByTeacher(appId, schoolId, result.getKidId(),
                    messageId, "received");
        }
        return result;
    }

    @RequestMapping(method = RequestMethod.PUT,
            value = "/chat/{appId}/{schoolId}/message/{messageId}/seen")
    public @ResponseBody ChatMessage seenMessage(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String messageId) {

    	ChatMessage chatMessage = storage.getChatMessage(appId, schoolId, messageId);
        if (!permissions.checkKidProfile(appId, schoolId, chatMessage.getKidId(), null)) {
            throw new SecurityException("User has no access to kid data");
        }
    	
        ChatMessage result = null;
        result = storage.chatMessageSeen(appId, schoolId, messageId);
        if (logger.isInfoEnabled()) {
            logger.info(String.format("seenMessage[%s]: %s - %s", appId, schoolId, messageId));
        }
        if (ChatMessage.SENT_BY_TEACHER.equals(result.getSender())) {
            notificationManager.notifyMessageStatusByParent(appId, schoolId, result.getKidId(),
                    messageId, "seen");
        } else {
            notificationManager.notifyMessageStatusByTeacher(appId, schoolId, result.getKidId(),
                    messageId, "seen");
        }
        return result;
    }

    @ExceptionHandler(SecurityException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ResponseBody
    public String handleSecurityError(HttpServletRequest request, Exception exception) {
        exception.printStackTrace();
        return "{\"error\":\"" + exception.getMessage() + "\"}";
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ResponseBody
    public String handleError(HttpServletRequest request, Exception exception) {
        exception.printStackTrace();
        return "{\"error\":\"" + exception.getMessage() + "\"}";
    }

    @ExceptionHandler(ProfileNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
    @ResponseBody
    public String handleProfileNotFoundError(HttpServletRequest request, Exception exception) {
        return "{\"error\":\"" + exception.getMessage() + "\"}";
    }
}

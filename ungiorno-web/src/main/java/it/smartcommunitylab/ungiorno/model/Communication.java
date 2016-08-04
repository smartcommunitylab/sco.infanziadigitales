/*******************************************************************************
 * Copyright 2015 Fondazione Bruno Kessler
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 ******************************************************************************/
package it.smartcommunitylab.ungiorno.model;

import java.util.List;

/**
 * @author raman
 *
 */
public class Communication extends SchoolObject {
	private String communicationId;
	private String text;
	private String teacherId;
	private long creationDate, expireDate;
	private List<String> recipientsChild;
	private List<String> recipientsGroup;
	private boolean deliveringDocument;
	private long dateToCheck;
	private List<String> deliveryChildren;
	
	public String getCommunicationId() {
		return communicationId;
	}
	public void setCommunicationId(String communicationId) {
		this.communicationId = communicationId;
	}
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	public String getTeacherId() {
		return teacherId;
	}
	public void setTeacherId(String teacherId) {
		this.teacherId = teacherId;
	}
	public long getCreationDate() {
		return creationDate;
	}
	public void setCreationDate(long creationDate) {
		this.creationDate = creationDate;
	}
	public long getExpireDate() {
		return expireDate;
	}
	public void setExpireDate(long expireDate) {
		this.expireDate = expireDate;
	}
	public List<String> getRecipientsChild() {
		return recipientsChild;
	}
	public void setRecipientsChild(List<String> recipientsChild) {
		this.recipientsChild = recipientsChild;
	}
	public List<String> getRecipientsGroup() {
		return recipientsGroup;
	}
	public void setRecipientsGroup(List<String> recipientsGroup) {
		this.recipientsGroup = recipientsGroup;
	}
	public boolean isDeliveringDocument() {
		return deliveringDocument;
	}
	public void setDeliveringDocument(boolean deliveringDocument) {
		this.deliveringDocument = deliveringDocument;
	}
	public long getDateToCheck() {
		return dateToCheck;
	}
	public void setDateToCheck(long dateToCheck) {
		this.dateToCheck = dateToCheck;
	}
	public List<String> getDeliveryChildren() {
		return deliveryChildren;
	}
	public void setDeliveryChildren(List<String> deliveryChildren) {
		this.deliveryChildren = deliveryChildren;
	}

}

// services/leadManagementApi.js
import RestApi, { offlineHandler } from "@/utils/RestApi";

// --- GET Operations ---
export const fetchLeads = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, search, leadSource, leadStatus, assignedTo, sort, order } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) queryParams.set('search', search);
    if (leadSource) queryParams.set('leadSource', leadSource);
    if (leadStatus) queryParams.set('leadStatus', leadStatus);
    if (assignedTo) queryParams.set('assignedTo', assignedTo);
    if (sort) queryParams.set('sort', sort);
    if (order) queryParams.set('order', order);

    return await RestApi.get(`/api/v1/crm/get-all-leads?${queryParams.toString()}`);
  });
};

export const fetchLeadById = async (id) => {
  return offlineHandler.get(async () => {
    try {
      const response = await RestApi.get(`/api/v1/crm/leads/${id}`);
      // RestApi.get returns axios response, so response.data is the API response body
      // API returns { message: '...', data: {...} }
      return response.data;
    } catch (error) {
      // Handle 404 errors gracefully - return empty data instead of throwing
      // This prevents React Query from logging the error
      if (error?.response?.status === 404 || error?._isLeadEndpoint404) {
        // Suppress the error from being logged by React Query
        return { message: 'Lead not found', data: null };
      }
      throw error;
    }
  });
};

export const fetchLeadActivities = async (id) => {
  return offlineHandler.get(async () => {
    try {
      const response = await RestApi.get(`/api/v1/crm/leads/${id}/activities`);
      // RestApi.get returns axios response, so response.data is the API response body
      // API returns { message: '...', data: [...] }
      return response.data;
    } catch (error) {
      // Handle 404 errors gracefully - return empty array instead of throwing
      // This prevents React Query from logging the error
      if (error?.response?.status === 404 || error?._isLeadEndpoint404) {
        // Suppress the error from being logged by React Query
        return { message: 'Activities not found', data: [] };
      }
      throw error;
    }
  });
};

// --- CUD Operations ---
export const addOrUpdateLead = async (payload, queryKey) => {
  // Handle both id and _id (MongoDB format)
  let leadId = payload.id || payload._id;
  
  // Ensure leadId is a string - handle objects
  if (leadId) {
    if (typeof leadId === 'object') {
      // If it's an object, try to extract the ID
      leadId = leadId.id || leadId._id || leadId.toString();
    }
    leadId = String(leadId);
    // Remove any invalid characters that might cause issues
    if (leadId === '[object Object]' || leadId === 'undefined' || leadId === 'null') {
      leadId = null;
    }
  }
  
  const isUpdate = !!leadId && leadId !== 'undefined' && leadId !== 'null' && leadId !== '[object Object]';
  
  const url = isUpdate 
    ? `/api/v1/crm/leads/${leadId}`
    : `/api/v1/crm/leads`;
  
  // Remove id/_id from payload before sending
  const { id, _id, ...data } = payload;
  
  // Use the correct offline handler method based on operation type
  if (isUpdate) {
    return offlineHandler.patch(async () => {
      return RestApi.patch(url, data, {
        offlineMetadata: { queryKey },
      });
    });
  } else {
    return offlineHandler.post(async () => {
      return RestApi.post(url, data, {
        offlineMetadata: { queryKey },
      });
    });
  }
};

export const deleteLead = async (id, queryKey) => {
  return offlineHandler.delete(async () =>
    RestApi.delete(`/api/v1/crm/leads/${id}`, {
      offlineMetadata: { queryKey },
    })
  );
};

export const bulkDeleteLeads = async (leadIds, queryKey) => {
  return offlineHandler.post(async () =>
    RestApi.post(`/api/v1/crm/leads/bulk-delete`, { leadIds }, {
      offlineMetadata: { queryKey },
    })
  );
};

export const bulkUpdateLeadStatus = async (leadIds, status, queryKey) => {
  return offlineHandler.post(async () =>
    RestApi.post(`/api/v1/crm/leads/bulk-update-status`, { leadIds, status }, {
      offlineMetadata: { queryKey },
    })
  );
};

// --- Communication Activities ---
// Simple Communication API using new separate table
export const fetchCommunications = async (leadId) => {
  return offlineHandler.get(async () => {
    const stringLeadId = String(leadId || '').trim();
    if (!stringLeadId || stringLeadId === '[object Object]') {
      throw new Error('Invalid lead ID');
    }
    try {
      const response = await RestApi.get(`/api/v1/crm/leads/${stringLeadId}/communications`);
      return response.data;
    } catch (error) {
      // Return empty array if 404
      if (error?.response?.status === 404) {
        return { message: 'Communications not found', data: [] };
      }
      throw error;
    }
  });
};

export const createCommunication = async (leadId, communicationData, queryKey) => {
  return offlineHandler.post(async () => {
    const stringLeadId = String(leadId || '').trim();
    if (!stringLeadId || stringLeadId === '[object Object]') {
      throw new Error('Invalid lead ID');
    }

    // Validate required fields
    if (!communicationData.type) {
      throw new Error('Communication type is required');
    }
    if (!communicationData.description || communicationData.description.trim() === '') {
      throw new Error('Description is required');
    }
    if (!communicationData.activityDate) {
      throw new Error('Activity date is required');
    }

    // Prepare payload - simple structure
    const payload = {
      type: communicationData.type,
      description: communicationData.description.trim(),
      activityDate: communicationData.activityDate,
      status: communicationData.status || 'pending',
    };

    const response = await RestApi.post(`/api/v1/crm/leads/${stringLeadId}/communications`, payload, {
      offlineMetadata: { queryKey },
    });
    
    return response.data;
  });
};

export const updateCommunication = async (communicationId, communicationData, queryKey) => {
  return offlineHandler.patch(async () => {
    const stringId = String(communicationId || '').trim();
    
    if (!stringId || stringId === '[object Object]' || stringId.length === 0) {
      throw new Error('Invalid communication ID: ID is missing or empty');
    }

    // Prepare payload - simple structure
    const payload = {
      type: communicationData.type,
      description: communicationData.description?.trim(),
      activityDate: communicationData.activityDate,
      status: communicationData.status,
    };

    const response = await RestApi.patch(`/api/v1/crm/communications/${stringId}`, payload, {
      offlineMetadata: { queryKey },
    });
    
    return response.data;
  });
};

export const deleteCommunication = async (communicationId, queryKey) => {
  return offlineHandler.delete(async () => {
    const stringId = String(communicationId || '').trim();
    if (!stringId || stringId === '[object Object]' || !/^[a-fA-F0-9]{24}$/.test(stringId)) {
      throw new Error('Invalid communication ID');
    }

    const response = await RestApi.delete(`/api/v1/crm/communications/${stringId}`, {
      offlineMetadata: { queryKey },
    });
    
    return response.data;
  });
};


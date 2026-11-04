// path: src/utils/syncService.js (NEW FILE - Essential logic moved from the rejected hook)
import { db } from "./offlineDB";
import {
  getQueue,
  removeFromQueue,
  updateQueueItem,
  QueueStatus,
  removeInvalidMutations,
} from "./offlineQueue"; // Reuse your offlineQueue helpers
import RestApi from "@/utils/RestApi"; // Import your API utility
import { useNetworkStore } from "@/utils/offline/networkStore"; // Import for state management
import { queryClient } from "@/providers/ReactQueryProvider"; // Import global queryClient
import { toaster } from "@/utils/helpers";

// Helper function to execute a raw request using the stored mutation data
// During sync, we're already online, so we use RestApi.request directly
// to bypass the offline queue and execute immediately
const executeRawRequest = async (method, path, payload) => {
  try {
    // Use RestApi.request directly to bypass offline queue during sync
    // This ensures we execute the request immediately since we're already online
    const response = await RestApi.request(method, path, payload);
    return response;
  } catch (error) {
    // If it's a callback error from the backend, provide a more helpful message
    if (error?.response?.data?.message?.includes('callback is not a function') ||
        error?.message?.includes('callback is not a function')) {
      console.error('❌ Backend callback error detected. This usually indicates a Mongoose operation issue.');
      console.error('Error details:', {
        method,
        path,
        payload: JSON.stringify(payload, null, 2),
        errorMessage: error?.response?.data?.message || error?.message,
      });
      // Re-throw with enhanced error info
      const enhancedError = new Error(`Backend error: ${error?.response?.data?.message || error?.message || 'callback is not a function'}`);
      enhancedError.response = error.response;
      enhancedError.config = error.config;
      throw enhancedError;
    }
    // Re-throw other errors as-is
    throw error;
  }
};

/**
 * Reads pending mutations from IndexedDB and attempts to resend them.
 * This is a utility function, not a hook.
 * @returns {Promise<void>}
 */

export const syncMutations = async () => {
  const { isSyncing, setSyncing } = useNetworkStore.getState();

  if (isSyncing) {
    console.log("Sync Service: Already syncing, skipping call.");
    return;
  }

  setSyncing(true);
  let success = true;
  const invalidatedKeys = new Set();
  let pendingMutations = []; // ✅ declare outside the try

  try {
    if (!db.isOpen()) {
      await db.open();
    }

    // Clean up invalid mutations before processing
    const removedCount = await removeInvalidMutations();
    if (removedCount > 0) {
      console.log(`🧹 Removed ${removedCount} invalid mutation(s) from queue`);
    }

    pendingMutations = await getQueue(); // ✅ assign here

    if (pendingMutations.length === 0) {
      console.log("Sync Service: No pending mutations to process.");
      return;
    }

    console.log(
      `🔄 Sync Service: Processing ${pendingMutations.length} mutations...`
    );

    const failedMutations = [];
    
    for (let index = 0; index < pendingMutations.length; index++) {
      const mutation = pendingMutations[index];
      let { id, method, path, payload, queryKey } = mutation;
      
      const mutationNumber = index + 1;
      console.log(`📋 Processing mutation ${mutationNumber}/${pendingMutations.length} (Queue ID: ${id}): ${method} ${path}`);

      try {
        // Fix path if it contains [object Object] - extract ID from payload if needed
        if (path && path.includes('[object Object]')) {
          console.warn(`⚠️ Mutation ${mutationNumber}: Found [object Object] in path: ${path}, attempting to fix...`);
          
          // Try to extract ID from payload or mutation data
          let extractedId = null;
          
          // For activities endpoints, try to get ID from payload or path
          if (path.includes('/activities/')) {
            // Try to extract from payload if it's an object with _id or id
            if (payload && typeof payload === 'object') {
              extractedId = payload._id || payload.id || payload.activityId;
            }
            
            // If still not found, try to extract from the path itself (before [object Object])
            if (!extractedId) {
              const pathParts = path.split('/');
              const activitiesIndex = pathParts.findIndex(p => p === 'activities');
              if (activitiesIndex >= 0 && activitiesIndex < pathParts.length - 1) {
                const idPart = pathParts[activitiesIndex + 1];
                if (idPart && idPart !== '[object Object]') {
                  extractedId = idPart;
                }
              }
            }
            
            // If we found an ID, reconstruct the path
            if (extractedId) {
              // Handle both string and object IDs
              if (typeof extractedId === 'object') {
                extractedId = extractedId._id || extractedId.id || extractedId.toString();
              }
              extractedId = String(extractedId).trim();
              
              // Validate MongoDB ObjectId format
              if (/^[a-fA-F0-9]{24}$/.test(extractedId)) {
                path = path.replace('[object Object]', extractedId);
                console.log(`✅ Mutation ${mutationNumber}: Fixed path: ${path}`);
              } else {
                console.error(`❌ Mutation ${mutationNumber}: Invalid ID format: ${extractedId}`);
                // Skip this mutation instead of throwing - mark as failed
                await updateQueueItem(id, {
                  status: QueueStatus.FAILED,
                  retryCount: (mutation.retryCount || 0) + 1,
                  timestamp: Date.now(),
                  error: `Invalid activity ID format: ${extractedId}`,
                });
                failedMutations.push({ 
                  number: mutationNumber,
                  id: mutation.id, 
                  method,
                  path,
                  error: `Invalid activity ID format: ${extractedId}`,
                  status: 400,
                });
                success = false;
                continue; // Skip to next mutation
              }
            } else {
              console.error(`❌ Mutation ${mutationNumber}: Could not extract ID from mutation:`, mutation);
              // Skip this mutation instead of throwing - mark as failed
              await updateQueueItem(id, {
                status: QueueStatus.FAILED,
                retryCount: (mutation.retryCount || 0) + 1,
                timestamp: Date.now(),
                error: `Cannot fix path with [object Object] - ID not found`,
              });
              failedMutations.push({ 
                number: mutationNumber,
                id: mutation.id, 
                method,
                path,
                error: `Cannot fix path with [object Object] - ID not found`,
                status: 400,
              });
              success = false;
              continue; // Skip to next mutation
            }
          } else {
            // For non-activities endpoints with [object Object], skip it
            console.error(`❌ Mutation ${mutationNumber}: Cannot fix path with [object Object] for non-activities endpoint: ${path}`);
            await updateQueueItem(id, {
              status: QueueStatus.FAILED,
              retryCount: (mutation.retryCount || 0) + 1,
              timestamp: Date.now(),
              error: `Cannot fix path with [object Object]`,
            });
            failedMutations.push({ 
              number: mutationNumber,
              id: mutation.id, 
              method,
              path,
              error: `Cannot fix path with [object Object]`,
              status: 400,
            });
            success = false;
            continue; // Skip to next mutation
          }
        }
        
        // Ensure payload has required fields for communication creation
        if (method === 'POST' && path.includes('/activities') && payload) {
          // Create a new payload object to avoid mutation issues
          payload = { ...payload };
          
          // Ensure metadata exists if it's missing
          if (!payload.metadata) {
            payload.metadata = {};
          }
          // Ensure status exists
          if (!payload.status) {
            payload.status = 'pending';
          }
          // Ensure activityDate is valid ISO string
          if (payload.activityDate && typeof payload.activityDate === 'string') {
            // If it's datetime-local format, convert to ISO
            if (!payload.activityDate.includes('Z') && !payload.activityDate.match(/[+-]\d{2}:\d{2}$/)) {
              try {
                const dateObj = new Date(payload.activityDate);
                if (!isNaN(dateObj.getTime())) {
                  payload.activityDate = dateObj.toISOString();
                }
              } catch (e) {
                console.warn(`⚠️ Mutation ${mutationNumber}: Could not convert activityDate to ISO:`, payload.activityDate);
              }
            }
          }
        }
        
        // Ensure payload is properly formatted for lead updates
        if ((method === 'PATCH' || method === 'POST') && path.includes('/leads') && payload) {
          // Create a new payload object to avoid mutation issues
          payload = { ...payload };
          
          // Remove any undefined values
          Object.keys(payload).forEach(key => {
            if (payload[key] === undefined) {
              delete payload[key];
            }
          });
          
          // Ensure contacts and remarks are arrays if they exist
          if (payload.contacts !== undefined && !Array.isArray(payload.contacts)) {
            payload.contacts = [];
          }
          if (payload.remarks !== undefined && !Array.isArray(payload.remarks)) {
            payload.remarks = [];
          }
        }
        
        console.log(`🔄 Processing mutation ${id}: ${method} ${path}`, { 
          payload,
          mutationId: id,
          timestamp: mutation.timestamp,
          retryCount: mutation.retryCount || 0,
        });
        await updateQueueItem(id, { status: QueueStatus.PROCESSING });
        
        // Execute the request - axios throws errors for non-2xx responses
        const response = await executeRawRequest(method, path, payload);
        
        // If we get here, the request succeeded (axios throws on error)
        // Axios response has status in response.status
        const status = response?.status || (response?.data ? 200 : null);
        
        if (status && status >= 200 && status < 300) {
          await removeFromQueue(id);
          console.log(`✅ Mutation ${mutationNumber} (ID: ${id}) succeeded and was removed from queue.`);
          if (queryKey) invalidatedKeys.add(queryKey[0]);
        } else {
          // This shouldn't happen if axios is working correctly, but handle it
          console.warn(`⚠️ Mutation ${mutationNumber} returned unexpected response:`, response);
          await removeFromQueue(id);
          console.log(`✅ Mutation ${mutationNumber} (ID: ${id}) completed (assuming success).`);
          if (queryKey) invalidatedKeys.add(queryKey[0]);
        }
      } catch (error) {
        let errorMessage = `Server error for mutation: ${method} ${path}.`;
        let errorDetails = {};

        if (error?.response) {
          errorDetails = {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            message: error.response.data?.message || error.message,
          };
          
          if (error.response.data?.message) {
            errorMessage = typeof error.response.data.message === 'string' 
              ? error.response.data.message 
              : JSON.stringify(error.response.data.message);
          } else if (error.response.status === 500) {
            errorMessage = `Internal Server Error (500) for ${method} ${path}`;
          } else if (error.response.status === 400) {
            errorMessage = `Bad Request (400) for ${method} ${path}`;
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }

        console.error(
          `❌ Mutation ${mutationNumber} (Queue ID: ${mutation.id}) failed during sync.`,
          {
            mutationNumber,
            mutationId: mutation.id,
            method,
            path,
            error: errorMessage,
            details: errorDetails,
            payload: JSON.stringify(payload, null, 2),
            mutationData: {
              id: mutation.id,
              method: mutation.method,
              path: mutation.path,
              timestamp: mutation.timestamp,
              retryCount: mutation.retryCount || 0,
              status: mutation.status,
              createdAt: mutation.createdAt,
            },
            fullError: error,
            errorStack: error?.stack,
          }
        );

        await updateQueueItem(mutation.id, {
          status: QueueStatus.FAILED,
          retryCount: (mutation.retryCount || 0) + 1,
          timestamp: Date.now(),
          error: errorMessage,
        });

        failedMutations.push({ 
          number: mutationNumber,
          id: mutation.id, 
          method,
          path,
          error: errorMessage,
          status: errorDetails.status,
        });
        success = false;
        // Continue processing other mutations instead of throwing
      }
    }
    
    // Show error toast only if there were failures
    if (failedMutations.length > 0) {
      const failedDetails = failedMutations.map(m => 
        `Mutation ${m.number}: ${m.method} ${m.path} (${m.status || 'unknown status'})`
      ).join(', ');
      toaster(
        `Sync completed with ${failedMutations.length} failure(s): ${failedDetails}`,
        "error"
      );
    }
  } catch (error) {
    console.error("Sync process interrupted or failed:", error);
    success = false;
  } finally {
    setSyncing(false);

    if (invalidatedKeys.size > 0) {
      console.log(
        "💥 TanStack Query cache invalidation triggered for keys:",
        Array.from(invalidatedKeys)
      );

      invalidatedKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    } else if (pendingMutations.length > 0) {
      // ✅ now accessible
      console.log(
        "⚠️ No specific query keys found for cache invalidation, but mutations were attempted."
      );
    }

    if (success) {
      console.log("⭐ All pending mutations synchronized successfully.");
    }
  }
};
// export const syncMutations = async () => {
//   const { isSyncing, setSyncing } = useNetworkStore.getState();

//   if (isSyncing) {
//     console.log("Sync Service: Already syncing, skipping call.");
//     return;
//   }

//   setSyncing(true);
//   let success = true;

//   // 🔑 1. Initialize a set to collect unique query keys from successful mutations
//   const invalidatedKeys = new Set();

//   try {
//     if (!db.isOpen()) {
//       await db.open();
//     }

//     const pendingMutations = await getQueue();

//     if (pendingMutations.length === 0) {
//       console.log("Sync Service: No pending mutations to process.");
//       return;
//     }

//     console.log(
//       `🔄 Sync Service: Processing ${pendingMutations.length} mutations...`
//     );

//     for (const mutation of pendingMutations) {
//       try {
//         // 🔑 Extract the queryKey from the mutation record
//         const { id, method, path, payload, queryKey } = mutation; // Added 'queryKey'

//         // 1. Mark as PROCESSING
//         await updateQueueItem(id, { status: QueueStatus.PROCESSING });

//         // 2. Execute the request
//         await executeRawRequest(method, path, payload);

//         // 3. On success: Remove from the queue
//         await removeFromQueue(id);
//         console.log(`✅ Mutation ${id} succeeded and was removed from queue.`);

//         // 🔑 2. Add the query key to the set for final invalidation
//         if (queryKey) {
//           // Ensure the key is stored as a stringified array or similar if needed,
//           // but for simple keys like ["notice"], just add the first element.
//           invalidatedKeys.add(queryKey[0]);
//         }
//       } catch (error) {
//         // 4. On API failure: Handle Error and Re-queue/Fail

//         // 🔑 ERROR HANDLING FOR SYNCED MUTATION
//         let errorMessage = `Server error for mutation: ${method} ${path}.`;

//         // Attempt to extract the actual error message (customize this based on your RestApi error format)
//         if (error && error.message) {
//           // This is a common pattern for Axios/Fetch wrappers
//           errorMessage = error.message;
//         } else if (
//           error &&
//           error.response &&
//           error.response.data &&
//           error.response.data.message
//         ) {
//           // Common for errors thrown by a structured API client
//           errorMessage = error.response.data.message;
//         }

//         // 🔑 Display a visible error to the user
//         toaster(`Sync Failed: ${errorMessage}`, "error");

//         console.error(
//           `❌ Mutation ${mutation.id} failed during sync. Error: ${errorMessage}`,
//           error
//         );

//         // 5. Mark as FAILED (or PENDING for retry later)
//         await updateQueueItem(mutation.id, {
//           status: QueueStatus.FAILED, // Mark as FAILED for manual review/retry
//           retryCount: (mutation.retryCount || 0) + 1,
//           timestamp: Date.now(),
//         });
//         success = false;

//         // IMPORTANT: Stop the entire sync process on the first failure.
//         // This prevents subsequent dependent requests from running against
//         // stale data or continuing a transaction that should have stopped.
//         throw new Error(
//           `Sync interrupted after server error on mutation ${mutation.id}`
//         );
//       }
//     }
//   } catch (error) {
//     console.error("Sync process interrupted or failed:", error);
//     success = false;
//   } finally {
//     setSyncing(false);

//     // 🔑 3. Invalidate cache after sync attempt, only if keys were collected
//     if (invalidatedKeys.size > 0) {
//       console.log(
//         "💥 TanStack Query cache invalidation triggered for keys:",
//         Array.from(invalidatedKeys)
//       );

//       // Invalidate ALL unique keys collected
//       invalidatedKeys.forEach((key) => {
//         // Note: The key is just the first element (e.g., "notice"), invalidating all variations
//         queryClient.invalidateQueries({ queryKey: [key] });
//       });
//     } else if (pendingMutations && pendingMutations.length > 0) {
//       console.log(
//         "⚠️ No specific query keys found for cache invalidation, but mutations were attempted."
//       );
//     }

//     if (success) {
//       console.log("⭐ All pending mutations synchronized successfully.");
//     }
//   }
// };

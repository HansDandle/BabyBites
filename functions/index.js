// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// This function will be triggered when an invitation document is updated
exports.acceptInvitation = functions.firestore
    .document("invitations/{invitationId}")
    .onUpdate(async (change, context) => {
      const newValue = change.after.data();
      const previousValue = change.before.data();

      // Only proceed if the status changed from 'pending' to 'accepted'
      if (previousValue.status === "pending" && newValue.status === "accepted") {
        const childId = newValue.childId;
        const inviteeEmail = newValue.inviteeEmail;

        functions.logger.log(
            `Invitation ${context.params.invitationId} accepted.`,
            `Child ID: ${childId}, Invitee Email: ${inviteeEmail}`
        );

        try {
          // 1. Get the invitee's UID from their email
          const userRecord = await admin.auth().getUserByEmail(inviteeEmail);
          const inviteeUid = userRecord.uid;

          // 2. Add the invitee's UID to the child's managers array
          const childRef = admin.firestore().collection("children").doc(childId);
          await childRef.update({
            managers: admin.firestore.FieldValue.arrayUnion(inviteeUid),
          });

          functions.logger.log(
              `Successfully added ${inviteeUid} to managers of child ${childId}.`
          );
        } catch (error) {
          functions.logger.error(
              `Error accepting invitation for ${inviteeEmail} on child ${childId}:`,
              error
          );
          // Optionally, you might want to revert the invitation status or log an error in Firestore
          // For now, we'll just log the error.
        }
      }
      return null;
    });

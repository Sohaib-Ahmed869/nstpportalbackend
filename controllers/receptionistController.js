const {
  Tenant,
  Room,
  GatePass,
  Receptionist,
  Clearance,
  LostAndFound,
  WorkPermit,
  Complaint,
} = require("../models");
const { validationUtils } = require("../utils");

const receptionistController = {
  getGatePasses: (req, res) => {
    try {
      const receptionistId = req.id;
      const towerId = req.towerId;

      const validation = validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      const gatePasses = GatePass.find({ tower: towerId }).lean();

      return res.status(200).send({ gatePasses });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  getUnhandledGatePasses: (req, res) => {
    try {
      const receptionistId = req.id;
      const towerId = req.towerId;

      const validation = validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      const gatePasses = GatePass.find({
        tower: towerId,
        handled_by: null || undefined,
      }).lean();

      return res.status(200).send({ gatePasses });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  getUnhandledHandledGatePasses: (req, res) => {
    // getting all gatepasses that are handled by this receptionist and the unhandled ones
    try {
      const receptionistId = req.id;
      const towerId = req.towerId;

      const validation = validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      let gatePasses = GatePass.find({
        tower: towerId,
        handled_by: receptionistId,
      }).lean();

      // add the unhandled gatepasses to the list
      const unhandledGatePasses = GatePass.find({
        tower: towerId,
        handled_by: null || undefined,
      }).lean();

      gatePasses = [...gatePasses, ...unhandledGatePasses];

      return res.status(200).send({ gatePasses });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  getWorkPermits: async (req, res) => {
    try {
      const receptionistId = req.id;
      const towerId = req.towerId;

      const validation = await validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      const workPermits = await WorkPermit.find({ tower: towerId }).lean();

      return res.status(200).send({ workPermits });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  getRoomBookings: (req, res) => {
    try {
      const receptionistId = req.id;
      const towerId = req.towerId;

      const validation = validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      const rooms = Room.find({ tower: towerId }).lean();

      return res.status(200).send({ rooms });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  getClearances: (req, res) => {
    try {
      const receptionistId = req.id;
      const towerId = req.towerId;

      const validation = validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      const clearances = Clearance.find({ tower: towerId }).lean();

      return res.status(200).send({ clearances });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  getComplaints: (req, res) => {
    try {
      const receptionistId = req.id;
      const towerId = req.towerId;

      const validation = validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      const complaints = Complaint.find({ tower: towerId }).filter(
        (complaint) => complaint.complaint_type === "Service"
      );

      return res.status(200).send({ complaints });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  getTenantComplaints: (req, res) => {
    try {
      const receptionistId = req.id;
      const towerId = req.towerId;
      const { tenantId } = req.params;

      const validation = validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      const validateTenant = validationUtils.validateTenant(tenantId);
      if (!validateTenant.isValid) {
        return res
          .status(validateTenant.status)
          .send({ message: validateTenant.message });
      }

      const tenant = Tenant.findById(tenantId);
      const complaints = tenant.complaints;

      return res.status(200).send({ complaints });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  addLostAndFound: async (req, res) => {
    try {
      const receptionistId = req.id;
      const towerId = req.towerId;
      const { item, description, image } = req.body;

      const validation = await validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      console.log(validation);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      const lostAndFound = new LostAndFound({
        tower: towerId,
        item,
        description,
        image,
        reported_by: receptionistId,
      });

      await lostAndFound.save();
      
      return res
        .status(200)
        .send({ message: "Lost and found item added successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  fileComplaint: (req, res) => {
    try {
      const receptionistId = req.id;
      const towerId = req.towerId;

      const { tenantId, subject, description } = req.body;

      if (!tenantId || !subject || !description) {
        return res
          .status(400)
          .send({ message: "Please provide all required fields" });
      }

      const validateTenant = validationUtils.validateTenant(tenantId);
      if (!validateTenant.isValid) {
        return res
          .status(validateTenant.status)
          .send({ message: validateTenant.message });
      }

      const validation = validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      const complaint = {
        subject,
        description,
      };

      const tenant = Tenant.findById(tenantId);
      tenant.complaints.push(complaint);

      tenant.save();

      return res
        .status(200)
        .send({ message: "Complaint filed successfully", complaint });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  handleGatePass: (req, res) => {
    try {
      const { gatepassId, approval, representative, reasonDecline } = req.body;
      const receptionistId = req.id;

      const validateGatePass = validationUtils.validateGatePass(gatepassId);
      if (!validateGatePass.isValid) {
        return res
          .status(validateGatePass.status)
          .send({ message: validateGatePass.message });
      }

      if (approval === undefined) {
        return res
          .status(400)
          .send({ message: "Please provide approval status" });
      }

      const gatePass = GatePass.findById(gatepassId).lean();
      const towerId = gatePass.tower;

      const validation = validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      gatePass.is_approved = approval;
      if (approval) {
        gatePass.tower_representative = representative;
      } else {
        if (!reasonDecline) {
          return res
            .status(400)
            .send({ message: "Please provide reason for decline" });
        }
        gatePass.reason_decline = reasonDecline;
      }
      gatePass.handled_by = receptionistId;
      const receptionist = Receptionist.findById(receptionistId);

      gatePass.save();
      receptionist.handled_gatepasses += 1;
      return res
        .status(200)
        .send({ message: "Gate pass updated successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  handleRoomBooking: (req, res) => {
    try {
      const receptionistId = req.id;
      const { roomId, bookingId, approval, reasonDecline } = req.body;
      const validateRoomBooking = validationUtils.validateRoomBooking(
        roomId,
        bookingId
      );
      if (!validateRoomBooking.isValid) {
        return res
          .status(validateRoomBooking.status)
          .send({ message: validateRoomBooking.message });
      }

      if (approval === undefined) {
        return res
          .status(400)
          .send({ message: "Please provide approval status" });
      }

      const room = Room.findById(roomId);
      const towerId = room.tower;

      const validation = validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      const booking = room.bookings.id(bookingId);

      booking.status_booking = approval;
      if (!approval) {
        if (!reasonDecline) {
          return res
            .status(400)
            .send({ message: "Please provide reason for decline" });
        }
        booking.reason_decline = reasonDecline;
      }

      booking.handled_by = receptionistId;
      const receptionist = Receptionist.findById(receptionistId);
      receptionist.handled_bookings += 1;

      room.save();
      receptionist.save();
      return res.status(200).send({ message: "Booking updated successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  cancelRoomBooking: (req, res) => {
    try {
      const receptionistId = req.id;
      const { roomId, bookingId } = req.body;
      const validateRoomBooking = validationUtils.validateRoomBooking(
        roomId,
        bookingId
      );
      if (!validateRoomBooking.isValid) {
        return res
          .status(validateRoomBooking.status)
          .send({ message: validateRoomBooking.message });
      }

      const room = Room.findById(roomId);
      const towerId = room.tower;

      const validation = validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      const booking = room.bookings.id(bookingId);

      booking.is_cancelled = true;
      booking.cancelled_by = req.id;

      room.save();
      return res
        .status(200)
        .send({ message: "Booking cancelled successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  resolveLostAndFound: (req, res) => {
    try {
      const receptionistId = req.id;
      const { lostAndFoundId } = req.body;

      const validateLostAndFound =
        validationUtils.validateLostAndFound(lostAndFoundId);
      if (!validateLostAndFound.isValid) {
        return res
          .status(validateLostAndFound.status)
          .send({ message: validateLostAndFound.message });
      }

      const lostAndFound = LostAndFound.findById(lostAndFoundId);
      const towerId = lostAndFound.tower;

      const validation = validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      if (lostAndFound.is_resolved) {
        return res
          .status(400)
          .send({ message: "Lost and found item is already resolved" });
      }

      lostAndFound.is_resolved = true;
      lostAndFound.resolved_by = receptionistId;
      lostAndFound.save();
      return res
        .status(200)
        .send({ message: "Lost and found item resolved successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },
};

module.exports = receptionistController;

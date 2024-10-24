const {
  Tenant,
  Room,
  RoomBooking,
  GatePass,
  Receptionist,
  Clearance,
  LostAndFound,
  WorkPermit,
  Complaint,
} = require("../models");
const { validationUtils } = require("../utils");

const receptionistController = {
  getDashboard: async (req, res) => {
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

      const allGatePasses = await GatePass.find({
        tower: towerId,
      }).lean();

      const gatePasses = {};
      gatePasses.completed = allGatePasses.filter(
        (gatePass) => gatePass.handled_by == receptionistId
      ).length;
      gatePasses.unhandled = allGatePasses.filter(
        (gatePass) => gatePass.handled_by == null || undefined
      ).length;

      const allRoomBookings = await RoomBooking.find({
        tower: towerId,
      }).lean();

      const updatedRoomBookings = await Promise.all(
        allRoomBookings.map(async (booking) => {
          const room = await Room.findById(booking.room_id).select("name");
          booking.room_name = room.name;
          const tenant = await Tenant.findById(booking.tenant_id).select(
            "registration.organizationName"
          );
          booking.tenant_name = tenant.registration.organizationName;
          return booking;
        })
      );

      const bookings = {};
      bookings.completed = allRoomBookings.filter(
        (booking) => booking.handled_by == receptionistId
      ).length;
      bookings.pending = allRoomBookings.filter(
        (booking) => booking.handled_by == null || undefined
      ).length;

      const allComplaints = await Complaint.find({
        tower: towerId,
        complaint_type: "Service",
      }).lean();

      const complaints = {};
      complaints.recieved = allComplaints.filter(
        (complaint) => complaint.complaint_type === "Service"
      ).length;
      complaints.resolved = allComplaints.filter(
        (complaint) => complaint.service_resolved_by == receptionistId
      ).length;
      complaints.unresolved = allComplaints.filter(
        (complaint) => complaint.service_resolved_by == null || undefined
      ).length;

      const dashboard = {
        gatePasses,
        allBookings: updatedRoomBookings,
        bookings,
        complaints,
      };

      return res.status(200).send({ dashboard });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },
  getGatePasses: async (req, res) => {
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

      const gatePasses = await GatePass.find({ tower: towerId })
        .populate("tenant_id")
        .populate("tower");

      return res.status(200).send({ gatePasses });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  getUnhandledGatePasses: async (req, res) => {
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

      const gatePasses = await GatePass.find({
        tower: towerId,
        handled_by: null || undefined,
      }).lean();

      return res.status(200).send({ gatePasses });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  getUnhandledHandledGatePasses: async (req, res) => {
    // getting all gatepasses that are handled by this receptionist and the unhandled ones
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

      let gatePasses = await GatePass.find({
        tower: towerId,
        handled_by: receptionistId,
      }).lean();

      // add the unhandled gatepasses to the list
      const unhandledGatePasses = await GatePass.find({
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
      // populate the tenant name
      await Promise.all(
        workPermits.map(async (workPermit) => {
          const tenant = await Tenant.findById(workPermit.tenant).lean();
          workPermit.tenant_name = tenant.registration.organizationName;
        })
      );

      return res.status(200).send({ workPermits });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  getClearances: async (req, res) => {
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

      const clearances = await Clearance.find({ tower: towerId }).lean();

      return res.status(200).send({ clearances });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  getComplaints: async (req, res) => {
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

      let complaints = await Complaint.find({
        tower: towerId,
        complaint_type: "Service",
      }).populate({
        path: "tenant_id",
        select: "registration.organizationName",
      });

      complaints = complaints.map((complaint) => {
        complaint.tenant_name =
          complaint.tenant_id.registration.organizationName;
        return complaint;
      });

      return res.status(200).send({ complaints });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  getTenants: async (req, res) => {
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

      let tenants = await Tenant.find({ tower: towerId }).select(
        "registration.organizationName"
      );

      tenants = tenants.map((tenant) => tenant.registration.organizationName);

      return res.status(200).send({ tenants });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  getTenantOccurences: async (req, res) => {
    // violations
    try {
      const receptionistId = req.id;
      const towerId = req.towerId;
      const { tenantId } = req.params;

      const validation = await validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      const validateTenant = await validationUtils.validateTenant(tenantId);
      if (!validateTenant.isValid) {
        return res
          .status(validateTenant.status)
          .send({ message: validateTenant.message });
      }

      const tenant = await Tenant.findById(tenantId);
      const complaints = tenant.complaints;

      return res.status(200).send({ complaints });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  getAllTenantsOccurences: async (req, res) => {
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

      let tenants = await Tenant.find({ tower: towerId }).select(
        "registration.organizationName complaints"
      );

      tenants = tenants.map((tenant) => ({
        tenantId: tenant._id,
        name: tenant.registration.organizationName,
        complaints: tenant.complaints,
      }));

      return res.status(200).send({ tenants });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  getLostAndFound: async (req, res) => {
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

      const lostAndFound = await LostAndFound.find({ tower: towerId });

      return res.status(200).send({ lostAndFound });
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

  getRooms: async (req, res) => {
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

      const rooms = await Room.find({ tower: towerId }).lean();

      return res.status(200).send({ rooms });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  getRoomBookings: async (req, res) => {
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

      let bookings = await RoomBooking.find({ tower: towerId }).lean();
      // get the tenant name and room name
      bookings = await Promise.all(
        bookings.map(async (booking) => {
          const tenant = await Tenant.findById(booking.tenant_id).select(
            "registration.organizationName"
          );
          const room = await Room.findById(booking.room_id).select("name");

          booking.tenant_name = tenant.registration.organizationName;
          booking.room_name = room.name;

          return booking;
        })
      );

      return res.status(200).send({ bookings });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  addOccurence: async (req, res) => {
    try {
      const receptionistId = req.id;
      const towerId = req.towerId;

      const { tenantId, subject, description } = req.body;

      if (!tenantId || !subject || !description) {
        return res
          .status(400)
          .send({ message: "Please provide all required fields" });
      }

      const validateTenant = await validationUtils.validateTenant(tenantId);
      if (!validateTenant.isValid) {
        return res
          .status(validateTenant.status)
          .send({ message: validateTenant.message });
      }

      const validation = await validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      let complaint = {
        subject,
        description,
      };

      const tenant = await Tenant.findById(tenantId);
      tenant.complaints.push(complaint);

      await tenant.save();

      complaint.date_filed = new Date();

      return res
        .status(200)
        .send({ message: "Complaint filed successfully", complaint });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  handleGatePass: async (req, res) => {
    try {
      const { gatepassId, approval, representative, reasonDecline } = req.body;
      const receptionistId = req.id;

      console.log("🚀 ~ handleGatePass: ~ req.body:", req.body);

      const validateGatePass = await validationUtils.validateGatePass(
        gatepassId
      );

      console.log("🚀 ~ handleGatePass: ~ validateGatePass", validateGatePass);

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

      const gatePass = await GatePass.findById(gatepassId);
      const towerId = gatePass.tower;

      console.log("🚀 ~ handleGatePass: ~ gatePass:", gatePass);

      const validation = await validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );

      console.log("🚀 ~ handleGatePass: ~ validation", validation);

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
      const receptionist = await Receptionist.findById(receptionistId);
      receptionist.handled_gatepasses += 1;

      await gatePass.save();
      await receptionist.save();
      return res
        .status(200)
        .send({ message: "Gate pass updated successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  handleRoomBooking: async (req, res) => {
    try {
      const receptionistId = req.id;
      const { bookingId, approval, reasonDecline } = req.body;

      const validateRoomBooking = await validationUtils.validateRoomBooking(
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

      const booking = await RoomBooking.findById(bookingId);
      const towerId = booking.tower;

      const validation = await validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      const tenant = await Tenant.findById(booking.tenant_id);
      booking.status_booking = approval ? "approved" : "rejected";
      if (!approval) {
        if (!reasonDecline) {
          return res
            .status(400)
            .send({ message: "Please provide reason for decline" });
        }
        booking.reason_decline = reasonDecline;
      } else {
        let bookingDuration =
          (new Date(booking.time_end) - new Date(booking.time_start)) /
          (1000 * 60 * 60);
        console.log(
          "🚀 ~ handleRoomBooking: ~ bookingDuration",
          bookingDuration
        );
        let bookingType;
        if (bookingDuration > 4) {
          bookingType = "per_hour";
        } else if (bookingDuration <= 4) {
          bookingType = "under_4_hours";
        }

        let tenantCategory = tenant.registration.category;
        tenantCategory = tenantCategory.toLowerCase();
        const room = await Room.findById(booking.room_id).populate("type");
        const rateList = room.type.rate_list;
        console.log("🚀 ~ handleRoomBooking: ~ tenantCategory", tenantCategory);
        console.log("🚀 ~ handleRoomBooking: ~ rateList", rateList);
        const rate = rateList.find((rate) => rate.category === tenantCategory);
        let cost = rate.rates.find(
          (rate) => rate.rate_type === bookingType
        ).rate;

        cost = cost * bookingDuration;

        const minutes = bookingDuration * 60;

        const newBooking = {
          booking: booking._id,
          minutes,
          cost,
        };

        tenant.bookings.push(newBooking);
      }

      booking.handled_by = receptionistId;
      booking.date_handled = new Date();
      const receptionist = await Receptionist.findById(receptionistId);
      receptionist.handled_bookings += 1;

      await booking.save();
      await tenant.save();
      await receptionist.save();

      return res
        .status(200)
        .send({ message: "Room booking updated successfully", booking });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  cancelRoomBooking: async (req, res) => {
    try {
      const receptionistId = req.id;
      const { bookingId, reasonCancel } = req.body;

      const validateRoomBooking = await validationUtils.validateRoomBooking(
        bookingId
      );
      if (!validateRoomBooking.isValid) {
        return res
          .status(validateRoomBooking.status)
          .send({ message: validateRoomBooking.message });
      }

      const booking = await RoomBooking.findById(bookingId);
      const towerId = booking.tower;

      const validation = await validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      booking.status_booking = "rejected";
      booking.is_cancelled = true;
      booking.cancelled_by = receptionistId;
      booking.reason_decline = reasonCancel;

      // Find the tenant and remove the booking from their bookings array
      const tenant = await Tenant.findById(booking.tenant_id);
      tenant.bookings = tenant.bookings.filter(
        (tenantBooking) => tenantBooking.booking.toString() != bookingId
      );

      await booking.save();
      await tenant.save();

      return res
        .status(200)
        .send({ message: "Room booking cancelled", booking });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  resolveLostAndFound: async (req, res) => {
    try {
      const receptionistId = req.id;
      const { lostAndFoundId } = req.body;

      const validateLostAndFound = await validationUtils.validateLostAndFound(
        lostAndFoundId
      );
      if (!validateLostAndFound.isValid) {
        return res
          .status(validateLostAndFound.status)
          .send({ message: validateLostAndFound.message });
      }

      const lostAndFound = await LostAndFound.findById(lostAndFoundId);
      const towerId = lostAndFound.tower;

      const validation = await validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      if (lostAndFound) {
        return res
          .status(400)
          .send({ message: "Lost and found item is already resolved" });
      }

      lostAndFound.is_resolved = true;
      lostAndFound.resolved_by = receptionistId;
      await lostAndFound.save();
      return res
        .status(200)
        .send({ message: "Lost and found item resolved successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  handleComplaint: async (req, res) => {
    try {
      const receptionistId = req.id;
      const { complaintId, approval } = req.body;

      const validateComplaint = await validationUtils.validateComplaint(
        complaintId
      );
      if (!validateComplaint.isValid) {
        return res
          .status(validateComplaint.status)
          .send({ message: validateComplaint.message });
      }

      if (approval === undefined) {
        return res
          .status(400)
          .send({ message: "Please provide approval status" });
      }

      const complaint = await Complaint.findById(complaintId);
      const towerId = complaint.tower;

      const validation = await validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      if (complaint.is_resolved) {
        return res
          .status(400)
          .send({ message: "Complaint is already resolved" });
      }

      let minutesToResolved = Math.abs(
        new Date(complaint.date_resolved) - new Date(complaint.date_initiated)
      );
      // convert to minutes
      minutesToResolved = Math.floor(minutesToResolved / 60000);

      complaint.is_resolved = approval;
      complaint.service_resolved_by = receptionistId;
      complaint.date_resolved = new Date();
      complaint.status = "resolved";
      complaint.time_to_resolve = minutesToResolved - complaint.buffer_time;
      const receptionist = await Receptionist.findById(receptionistId);
      receptionist.handled_complaints += 1;

      await complaint.save();
      await receptionist.save();
      return res
        .status(200)
        .send({ message: "Complaint updated successfully", complaint });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },

  giveComplaintFeedback: async (req, res) => {
    try {
      const receptionistId = req.id;
      const { complaintId, feedback } = req.body;

      if (!feedback) {
        return res.status(400).send({ message: "Please provide feedback" });
      }

      const validateComplaint = await validationUtils.validateComplaint(
        complaintId
      );
      if (!validateComplaint.isValid) {
        return res
          .status(validateComplaint.status)
          .send({ message: validateComplaint.message });
      }

      const complaint = await Complaint.findById(complaintId);
      const towerId = complaint.tower;

      const validation = await validationUtils.validateReceptionistAndTower(
        receptionistId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .send({ message: validation.message });
      }

      const feedbackObj = {
        feedback,
        date: new Date(),
        service_feedback_by: receptionistId,
      };

      complaint.feedback.push(feedbackObj);

      await complaint.save();

      return res
        .status(200)
        .send({ message: "Feedback given successfully", complaint });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  },
};

module.exports = receptionistController;

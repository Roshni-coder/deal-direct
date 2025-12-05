import PropertyType from "../models/PropertyType.js";

export const createPropertyType = async (req, res) => {
  try {
    const exists = await PropertyType.findOne({ name: req.body.name });
    if (exists) return res.status(400).json({ message: "Already exists" });

    const type = await PropertyType.create(req.body);
    res.status(201).json(type);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPropertyTypes = async (req, res) => {
  try {
    const list = await PropertyType.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePropertyType = async (req, res) => {
  try {
    const propertyType = await PropertyType.findByIdAndDelete(req.params.id);
    if (!propertyType) return res.status(404).json({ message: "Property type not found" });
    res.json({ message: "Property type deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePropertyType = async (req, res) => {
  try {
    const updated = await PropertyType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Property type not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

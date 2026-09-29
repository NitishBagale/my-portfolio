function registerMessageDeleteRoutes(app, pool, authenticateAdmin) {
  app.delete("/api/messages", authenticateAdmin, async (_req, res) => {
    try {
      const result = await pool.query("DELETE FROM messages");
      res.json({ message: "All messages deleted successfully", deletedCount: result.rowCount });
    } catch (error) {
      console.error("Error deleting messages:", error.message);
      res.status(500).json({ message: "Failed to delete messages" });
    }
  });

  app.delete("/api/messages/:id", authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
      return res.status(400).json({ message: "Invalid message ID" });
    }
    try {
      const result = await pool.query(
        "DELETE FROM messages WHERE id = $1 RETURNING id", [id]
      );
      if (!result.rows.length) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ message: "Message deleted successfully", id: result.rows[0].id });
    } catch (error) {
      console.error("Error deleting message:", error.message);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });
}

module.exports = { registerMessageDeleteRoutes };

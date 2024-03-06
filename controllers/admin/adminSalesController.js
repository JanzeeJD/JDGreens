import Order from '../../models/Order.js';
import PDFDocument from 'pdfkit-table';
import ExcelJS from 'exceljs';

export async function GetSalesReportPage(req,res){
  res.locals.activePanel = 'sales';
  const orders = await Order.find().sort({createdAt:-1});
  res.render("admin/sales", { orders });
}

export function GenerateSalesReport(req, res) {
  const startingDate = new Date(req.body.startingDate);
  const endingDate = new Date(req.body.endingDate);
  endingDate.setDate(endingDate.getDate() + 1);

  const { format } = req.params;
  if (format === 'pdf') {
    generatePDFReport(res, startingDate, endingDate);
  } else {
    generateExcelReport(res, startingDate, endingDate);
  }
}

export async function generateExcelReport(res, startingDate, endingDate) {
  try {
    const orders = await Order.find({
      createdAt: { $gte: startingDate, $lte: endingDate },
    });

    // Check if orders array is empty
    if (orders.length === 0) {
      res.status(404).json({ message: 'No data found for the given date range' });
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");

    // Add data to the worksheet
    worksheet.columns = [
      { header: "Reference ID", key: "orderId", width: 15 },
      { header: "Product", key: "productName", width: 20 },
      { header: "Price", key: "price", width: 15 },
      { header: "Quantity", key: "quantity", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Address", key: "address", width: 30 },
      { header: "Pincode", key: "pin", width: 15 },
      { header: "State", key: "state", width: 15 },
      { header: "Order Date", key: "orderDate", width: 18 },
    ];

    for (const order of orders) {
      const orderId = order._id;
      const orderDate = order.createdAt;
      const address =  order.address?.houseName + ', ' + order.address?.street
      const pin = order.address.pin;
      const state = order.address.state;
      const status = order.status;

      for (const item of order.items) {
        worksheet.addRow({
          orderId,
          status,
          orderDate,
          address,
          pin,
          state,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity
        });
      }
    }

    // Generate the Excel file and send it as a response
    workbook.xlsx.writeBuffer().then((buffer) => {
      const excelBuffer = Buffer.from(buffer);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=excel.xlsx");
      res.send(excelBuffer);
    });

  } catch (error) {
    console.error("Error generating excel:", error);
    res.status(500).send("Internal Server Error");
  }
}


/**
 * 
 * @param {Date} startingDate 
 * @param {Date} endingDate 
 * @returns 
 */
async function generatePDFReport(res, startingDate, endingDate) {
      const orders = await Order.find({
        createdAt: { $gte: startingDate, $lte: endingDate },
      }).populate('user');

      // Check if orders array is empty
      if (orders.length === 0) {
        res.status(404).json({ message: 'No data found for the given date range' });
        return;
      }

      const doc = new PDFDocument();
      const filename = "JDGreenz Sales Report.pdf";

      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.setHeader("Content-Type", "application/pdf");

      doc.pipe(res);

      // Add company name, logo, place, pincode, etc.
      doc.font("Helvetica-Bold").text("JD Greens", { font: 36, align: "center", margin: 10 });

      // Add logo to the left side
      //   doc.image('public/img/somePlant.jpeg', {
      //     width: 100,
      //     x: 410, // Adjust for desired left margin
      //     y: 80 // Adjust for vertical position
      // });
      
      doc.moveDown();

      // Add other invoice details
      doc.text(`Address:  Dotspace Business Park`, { font: 10 });
      doc.text(`Pincode: 695582`, { font: 10 });
      doc.text(`Phone: 000 000 000`, { font: 10 });

      // Move to the next line after the details
      doc.moveDown();

      doc.moveDown(); // Move down after the title
      doc.font("Helvetica-Bold").text(`Sales Report `, { font: 10, align: "center", margin: 10 });
      doc.font("Helvetica-Bold").text(` From  ${startingDate.getDay()}-${startingDate.getMonth()+1}-${startingDate.getFullYear()}  To ${endingDate.getDay()}- ${endingDate.getMonth()+1}- ${endingDate.getFullYear()} `, { font: 14, align: "center", margin: 10 });

      doc.moveDown(); // Move down after the title
      const tableData = {
        headers: [
          "Name",
          "Price",
          "Quantity",
          "Address",
          "Pincode",
          "State",
        ],

        rows: orders.flatMap((order) => {
          return order.items.map((productDetail) => [
            order.user?.name + ' ',
            '$ ' + productDetail?.price,
            productDetail?.quantity,
            order.address?.houseName + ', ' + order.address?.street,
            order.address?.pin,
            order.address?.state,
          ]);
        }),
      };

      // Customize the appearance of the table
      await doc.table(tableData, {
        prepareHeader: () => doc.font("Helvetica-Bold"),
        prepareRow: (row, i) => doc.font("Helvetica").fontSize(12),
        hLineColor: '#b2b2b2', // Horizontal line color
        vLineColor: '#b2b2b2', // Vertical line color
        textMargin: 5, // Margin between text and cell border
      });

      // Finalize the PDF document
      doc.end();
}

export async function generateStatistics() {
  let stats = {};

  const ordersAmount = await Order.estimatedDocumentCount();
  stats.NoOfOrders = ordersAmount;

  const result = await Order.aggregate([
    {
      $unwind: "$items" // Unwind the items array to create a separate document for each item
    },
    {
      $group: {
        _id: null,
        totalItems: { $sum: "$items.quantity" }, 
        totalAmountPayable: { $sum: "$amountPayable" },
        totalDiscount: { $sum: "$discountAmount" }
      }
    }
  ]);

  if (result.length > 0) {
    stats.NoOfProducts = result[0].totalItems;
    stats.TotalAmountPayable = result[0].totalAmountPayable;
    stats.TotalDiscount = result[0].totalDiscount;
  } else {
    stats.NoOfProducts = 0;
    stats.TotalAmountPayable = 0;
    stats.TotalDiscount = 0;
  }
  console.log(stats);
  return stats;
}


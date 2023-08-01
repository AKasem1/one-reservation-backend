const Grade = require("../models/GradeModel")
const requireAuth = require("../middleware/requireAuth")

const checkGradeExist = async (gradeName, moduleName, price, balance) =>{
    const gradeExist = await Grade.findOne({
        gradeName
      });
      const modules = {
        moduleName,
        createdAt: new Date(),
        price
      }
    if(gradeExist){
        console.log("Grade already exists: ")
        gradeExist.modules.push(modules)
        await gradeExist.save()
        const aggregationResult = await Grade.aggregate([
            { $match: { _id: gradeExist._id } },
            { $unwind: "$modules" },
            {
              $group: {
                _id: "$_id",
                total: { $sum: "$modules.price" },
              },
            },
          ]);
      
          const sumPrices = aggregationResult[0].total;
          gradeExist.balance = sumPrices;
          await gradeExist.save()
        console.log("Grade is updated successfully")
    }
    else{
        console.log("Grade does not exist")
        const newGrade = new Grade ({
            gradeName,
            modules,
            balance
        })
        await newGrade.save()
        console.log("Grade is added successfully")
    }
    
}
const insertGrade = async (req, res) => {
    const {gradeName, moduleName, price, balance} = req.body
    try {
        console.log(gradeName, moduleName, price, balance)
        if(!gradeName || !moduleName || !price || !balance){
            return res.status(422).json({error: "Please Add All fields"})
        }
        await checkGradeExist(gradeName, moduleName, price, balance)
            res.status(200).json({ message: "Successfull!" });
    } catch (error) {
        console.log("Catch error");
        res.status(400).json({ error: error.message });
    }
}

const getAllGrades = async (req,res)=>{
  await Grade.find()
  .then(grades=>{
      res.json({grades})
  })
  .catch(err=>{
      console.log(err)
  })
}

const updateGrade = async (req, res) =>{
  const {gradeName, moduleName, price, stock} = req.body
  console.log({gradeName, moduleName, price, stock})
  try {
    const grade = await Grade.findOne({gradeName})
    if (!grade) {
      return res.status(404).json({ error: "Grade not found" });
    }

    if (grade.modules) {
      for (let i = 0; i < grade.modules.length; i++) {
        if (grade.modules[i] && grade.modules[i].moduleName === moduleName) {
          grade.modules[i].stock = stock;
          grade.modules[i].price = price;
        }
      }
    } else {
      return res.status(404).json({ error: "Modules not found in grade" });
    }
    await grade.save()
    res.status(200).json({ message: "Grade updated successfully", grade });
  } catch (error) {
    console.log("Catch error in updating grade: ", gradeName);
    res.status(400).json({ error: error.message });
  }
}

const getGrade = async (req,res)=>{
  const {gradeName} = req.params
  console.log("gradeName: ", gradeName)
    const grade = await Grade.findOne({gradeName})
    if(!grade){
        return res.status(404).json({error: "No such grade found"})
    }
    res.status(200).json({
      "message": "this is what you want",
      grade
    })
}

module.exports = {insertGrade, getAllGrades, updateGrade, getGrade}
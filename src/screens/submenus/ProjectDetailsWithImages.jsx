////sos final
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { useSearchExport } from "../../context/SearchExportContext";
import { ShowContext } from "../../context/ShowContext";
import NewResuableForm from "../../components/form/NewResuableForm";
import SearchInput from "../../components/search/SearchInput";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import instance from "../../api/AxiosInstance";
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaPlus, FaTrashAlt } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { ThreeDots } from "react-loader-spinner";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import "../../App.scss";
import axios from "axios";
const ProjectDetailsWithImages = () => {
  const baseURL = instance.defaults.baseURL;
  // const {  setData, filteredData } =
  //   useSearchExport();
  const { searchQuery, handleSearch, handleExport, setData, filteredData } =
    useSearchExport();
  const [team, setTeam] = useState([]);
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [eyeVisibilityById, setEyeVisibilityById] = useState({});
  const [imagePreview, setImagePreviews] = useState("");
  const [showTable, setShowTable] = useState(true); // New state for toggling form and table view
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [projectcategory, setProjectcategory] = useState([]);
  const [projectname, setProjectname] = useState([]);
  const [filteredProjectNames, setFilteredProjectNames] = useState([]);
  const [isCategorySelected, setIsCategorySelected] = useState(false);

  const [loading, setLoading] = useState(false);
  const CustomHeader = ({ name }) => (
    <div style={{ fontWeight: "bold", color: "black", fontSize: "16px" }}>
      {name}
    </div>
  );

  const CustomHeader2 = ({ name }) => (
    <div style={{ fontWeight: "bold", color: "black", fontSize: "16px", marginLeft:"auto" }}>
      {name}
    </div>
  );


  const tableColumns = (currentPage, rowsPerPage) => [
    {
      name: <CustomHeader name="Sr. No." />,
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width:'95px',
    },

    {
      name: <CustomHeader name="Category" />,
      cell: (row) => <span>{row.project_category}</span>,
      width:'120px',
    },
    {
      name: <CustomHeader name="Name" />,
      cell: (row) => <span>{row.project_name}</span>,
      width:'120px',
    },
    // {
    //   name: <CustomHeader name="Project Location" />,
    //   cell: (row) => <span>{row.project_location}</span>,
    // },
    // {
    //   name: <CustomHeader name="Project Info" />,
    //   cell: (row) => <span>{row.project_info}</span>,
    // },
    // {
    //   name: <CustomHeader name="Project Year Of Completion" />,
    //   cell: (row) => <span>{row.project_year_of_completion}</span>,
    // },
    // {
    //   name: <CustomHeader name="Project Total Tonnage" />,
    //   cell: (row) => <span>{row.project_total_tonnage}</span>,
    // },
    // {
    //   name: <CustomHeader name="Project Status" />,
    //   cell: (row) => <span>{row.project_status}</span>,
    // },
    {
      name: <CustomHeader name="Images" />,
      cell: (row) => {
        const images = JSON.parse(row.project_images); // Parse the JSON string into an array

        // Check if images array exists and is not empty
        if (images && images.length > 0) {
          return (
            <div               style={{
              display: "flex",
              flexWrap: "wrap",
              maxHeight: "250px", // Set fixed height for the image container
              overflowY: "auto", // Enable vertical scrolling only for images
            }}>
              {images.map((image, index) => (
                <>
                  {" "}
                  <img
                    key={index}
                    src={`${baseURL}${image}`} // Access each image
                    alt={`ProjectImage-${index}`}
                    style={{
                      width: "70px",
                      height: "70px",
                      marginRight: "5px",
                      marginBottom: "5px",
                    }}
                  />
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="delete-tooltip">Delete</Tooltip>}
                  >
                    <Button
                      className="p-0"
                      style={{
                        backgroundColor: "red",
                        color: "white",
                        borderColor: "red",
                        height: "20px",
                        width: "20px",
                        fontSize: "10px",
                      }}
                      onClick={() => handleDelete2(row.id, image)} // Pass the image path here
                    >
                      <FaTrash />
                    </Button>
                  </OverlayTrigger>
                </>
              ))}
            </div>
          );
        } else {
          return <span>No Images Available</span>; // Fallback if no images exist
        }
      },
    },

    {
      name: <CustomHeader2 name="Actions" />,
      cell: (row) => (
        <div className="d-flex">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="edit-tooltip">Edit</Tooltip>}
          >
            <Button className="ms-1" onClick={() => toggleEdit(row.id)}>
              {/* <FaEdit /> */}
              <FaPlus />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="delete-tooltip">Delete</Tooltip>}
          >
            <Button
              className="ms-1"
              style={{
                backgroundColor: "red",
                color: "white",
                borderColor: "red",
              }}
              onClick={() => handleDelete(row.id)}
            >
              <FaTrash />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="visibility-tooltip">
                {eyeVisibilityById[row.id] ? "Hide" : "Show"}
              </Tooltip>
            }
          >
            <Button
              className="ms-1"
              style={{
                backgroundColor: eyeVisibilityById[row.id] ? "red" : "green",
                borderColor: eyeVisibilityById[row.id] ? "red" : "green",
                color: "white",
              }}
              onClick={() => handleIsActive(row.id, !eyeVisibilityById[row.id])}
            >
              {eyeVisibilityById[row.id] ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </OverlayTrigger>
        </div>
      ),
      style: { flex: "none" },
    },
  ];

  useEffect(() => {
    fetchTeam();
    // Retrieve and set visibility state from localStorage
    const storedVisibility =
      JSON.parse(localStorage.getItem("eyeVisibilityById")) || {};
    setEyeVisibilityById(storedVisibility);
  }, []);

  useEffect(() => {
    // Store visibility state in localStorage whenever it changes
    localStorage.setItem(
      "eyeVisibilityById",
      JSON.stringify(eyeVisibilityById)
    );
  }, [eyeVisibilityById]);

  useEffect(() => {
    if (formData.img && formData.img instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(reader.result); // Use the base64 URL from the FileReader
      };
      reader.readAsDataURL(formData.img); // Read as data URL
    } else if (formData.img && typeof formData.img === "string") {
      setImagePreviews(formData.img); // Directly use the image URL from formData.img
    } else {
      setImagePreviews(""); // Clear the preview if no image is provided
    }
  }, [formData.img]);

  const fetchTeam = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("accessToken"); // Retrieve access token
    try {
      const response = await instance.get(
        "/projectDetailsWithImages/projects",
        {
          headers: {
            Authorization: "Bearer " + accessToken,
            "Content-Type": "application/json",
          },
        }
      );
      const reversedData = response.data.reverse();
      //   console.log("Fetched data:", reversedData);
      setTeam(reversedData);
      setData(reversedData);
    } catch (error) {
      console.error(
        "Error fetching team:",
        error.response || error.message || error
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (formData, isEditMode) => {
    let errors = {};
    let isValid = true;
    // if (!isEditMode || (formData.img && formData.img.length > 0)) {
    //   if (formData.img && formData.img.length > 0) {
    //     formData.img.forEach((file, index) => {
    //       if (!validateImageSize(file)) {
    //         errors.img = `Image ${file.name} is required with 338x220 pixels`;
    //         isValid = false;
    //       }
    //     });
    //   } else {
    //     errors.img = "Image is not 338x220 pixels";
    //     isValid = false;
    //   }
    // }
    if (!isEditMode || (formData.img && formData.img.length > 0)) {
      if (formData.img && formData.img.length > 0) {
        formData.img.forEach((file) => {
          if (!validateImageSize(file)) {
            errors.img = `Image ${file.name} must be less than 2MB`;
            isValid = false;
          }
        });
      } else {
        errors.img = "Image is required";
        isValid = false;
      }
    }

    if (!formData.project_category?.trim()) {
      errors.project_category = "project category is required";
      isValid = false;
    }

    if (!formData.project_name?.trim()) {
      errors.project_name = "project name is required";
      isValid = false;
    }

    // if (!formData.project_location?.trim()) {
    //   errors.project_location = "project location is required";
    //   isValid = false;
    // }

    // if (!formData.project_total_tonnage?.trim()) {
    //   errors.project_total_tonnage = "project total tonnage is required";
    //   isValid = false;
    // }
    // if (!formData.project_year_of_completion) {
    //   errors.project_year_of_completion =
    //     "project year of completion is required";
    //   isValid = false;
    // }
    // if (!formData.project_status?.trim()) {
    //   errors.project_status = "project status is required";
    //   isValid = false;
    // }
    // if (!formData.project_info?.trim()) {
    //   errors.project_info = "project info is required";
    //   isValid = false;
    // }

    // else if (formData.desc.length > 1000) {
    //   errors.desc = "Description must be 1000 characters or less";
    //   isValid = false;
    // }

    setErrors(errors);
    return isValid;
  };

  // const validateImageSize = (file) => {
  //   return new Promise((resolve, reject) => {
  //     const img = new Image();
  //     img.onload = () => {
  //       if (img.width === 338 && img.height === 220) {
  //         resolve(); // Validation successful
  //       } else {
  //         reject(`Image "${file.name}" must be 338x220 pixels`); // Reject with specific error
  //       }
  //     };
  //     img.onerror = () => reject("Error loading image");
  //     img.src = URL.createObjectURL(file); // Set image source
  //   });
  // };

  const validateImageSize = (file) => {
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    return file.size <= maxSize; // Returns true if file size is within limit
  };

  //   const handleChange = async (name, value) => {
  //     if (name === "img" && value instanceof File) {
  //       try {
  //         await validateImageSize(value);
  //         setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  //         setErrors((prevErrors) => ({ ...prevErrors, img: "" }));
  //       } catch (error) {
  //         setErrors((prevErrors) => ({ ...prevErrors, img: error }));
  //         setImagePreview("");
  //       }
  //     } else {
  //       setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  //       setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  //     }
  //   };

  // Fetch the location based on the selected project name
  const fetchProjectLocation = async (projectName) => {
    try {
      const response = await instance.get(
        "projectDetails/find-projectDetails",
        {
          params: { project_name: projectName },
        }
      );

      const project = response.data.responseData.find(
        (item) => item.project_name === projectName
      );

      setFormData((prevFormData) => ({
        ...prevFormData,
        project_location: project ? project.project_location : "",
      }));
    } catch (error) {
      console.error("Error fetching project location:", error);
      setFormData((prevFormData) => ({
        ...prevFormData,
        project_location: "",
      }));
    }
  };

  // const handleChange = async (name, value) => {

  //       // Restrict project_status field to only alphabets and spaces
  //       if (name === "project_status" && !/^[a-zA-Z\s]*$/.test(value)) {
  //         setErrors((prevErrors) => ({ ...prevErrors, [name]: "Only alphabets and spaces are allowed." }));
  //         return;  // Prevent updating state
  //       }

  //           // Restrict project_year_of_completion to only numbers
  //         if (name === "project_year_of_completion" && !/^\d*$/.test(value)) {
  //           setErrors((prevErrors) => ({ ...prevErrors, [name]: "Only numbers are allowed." }));
  //           return;  // Prevent updating state
  //       }

  //   if (name === "project_category") {
  //     const categoryId = projectcategory.find((c) => c.title === value)?.id;
  //     console.log(categoryId);

  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       project_category: value,
  //       project_category_id: categoryId,
  //       project_name: "", // Reset project name when category changes
  //       project_location: "", // Clear project location
  //       project_name_id: "", // Reset project_name_id
  //     }));

  //     // Reset the flag and filtered project names when category changes
  //     setIsCategorySelected(false);
  //     setFilteredProjectNames([]);
  //   } else if (name === "project_name") {
  //     const selectedProject = filteredProjectNames.find(
  //       (project) => project.project_name === value
  //     );
  //     const selectedProjectId = selectedProject ? selectedProject.id : null;

  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       project_name: value,
  //       project_name_id: selectedProjectId, // Set project_name_id
  //     }));

  //     // Fetch the project location once a project name is selected
  //     if (value) {
  //       await fetchProjectLocation(value); // Fetch project location based on the selected project name
  //     }
  //   } else {
  //     setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  //   }

  //   setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  // };


useEffect(() => {
  if (formData.project_category) {
    // Find category ID from the selected category
    const categoryId = projectcategory.find(c => c.title === formData.project_category)?.id;

    // Fetch project names based on the stored category ID
    const filteredNames = projectname.filter(project => project.project_category_id === categoryId);

    // Update state with filtered names
    setFilteredProjectNames(filteredNames);
  }
}, [formData.project_category, projectcategory, projectname]);

  const handleChange = async (name, value) => {
  // Restrict project_status field to only alphabets and spaces
  if (name === "project_status" && !/^[a-zA-Z\s]*$/.test(value)) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "Only alphabets and spaces are allowed.",
    }));
    return; // Prevent updating state
  }

  // Restrict project_year_of_completion to only numbers
  if (name === "project_year_of_completion" && !/^\d*$/.test(value)) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "Only numbers are allowed.",
    }));
    return; // Prevent updating state
  }

  if (name === "project_category") {
    const categoryId = projectcategory.find((c) => c.title === value)?.id;
    console.log(categoryId);

    setFormData((prevFormData) => ({
      ...prevFormData,
      project_category: value,
      project_category_id: categoryId,
      project_name: "", // Reset project name when category changes
      project_location: "", // Clear project location
      project_name_id: "", // Reset project_name_id
    }));

    // Reset the flag and filtered project names when category changes
    setIsCategorySelected(false);
    setFilteredProjectNames([]);
  } else if (name === "project_name") {
    const selectedProject = filteredProjectNames.find(
      (project) => project.project_name === value
    );
    const selectedProjectId = selectedProject ? selectedProject.id : null;

    setFormData((prevFormData) => ({
      ...prevFormData,
      project_name: value,
      project_name_id: selectedProjectId, // Set project_name_id
    }));

    if (value) {
      // Fetch the project location once a project name is selected
      const projectLocation = await fetchProjectLocation(value);

      if (!projectLocation) {
        // setErrors((prevErrors) => ({
        //   ...prevErrors,
        //   project_location:
        //     "Project location not added. Please first add the project location for this project name.",
        // }));
      } else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          project_location: projectLocation,
        }));

        // Clear the error if location is found
        setErrors((prevErrors) => ({ ...prevErrors, project_location: "" }));
      }
    }
  } else {
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  }

  setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
};


  // const handleChange = async (name, value) => {
  //   if (name === "project_category") {
  //     // Find the categoryId based on selected category title
  //     const categoryId = projectcategory.find((c) => c.title === value)?.id;

  //     // Set the selected category and clear the project name field
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       project_category: value,
  //       project_category_id: categoryId,
  //       project_name: "", // Clear the project name when category is changed
  //     }));

  //     // Fetch project names for the selected category
  //     const filteredNames = projectname.filter(
  //       (project) => project.project_category_id === categoryId
  //     );
  //     setFilteredProjectNames(filteredNames); // Update the filtered project names list
  //   } else if (name === "project_name") {
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //        project_name_id: categoryId;
  //       project_name: value,
  //     }));
  //   } else {
  //     setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  //   }

  //   // Reset errors for this field
  //   setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  // };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await instance.get("category/get-category");
        console.log("categories:", response.data.responseData);

        setProjectcategory(
          Array.isArray(response.data.responseData)
            ? response.data.responseData
            : []
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
        setProjectcategory([]);
      }
    };

    const fetchProjectname = async () => {
      try {
        const response = await instance.get("projectDetails/find-projectDetails");
        console.log("categories:", response.data.responseData);

        setProjectname(
          Array.isArray(response.data.responseData)
            ? response.data.responseData
            : []
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
        setProjectname([]);
      }
    };

    fetchCategories();
    fetchProjectname();
  }, []);

  useEffect(() => {
    if (formData.project_category) {
      // Fetch filtered project names based on selected category, only if category is selected and not yet fetched
      const categoryId = projectcategory.find(
        (c) => c.title === formData.project_category
      )?.id;
      if (categoryId && !isCategorySelected) {
        const filteredNames = projectname.filter(
          (project) => project.project_category_id === categoryId
        );
        setFilteredProjectNames(filteredNames);
        setIsCategorySelected(true); // Set flag to prevent re-fetching on every render
      }
    }
  }, [formData.project_category, projectname, isCategorySelected]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm(formData, editMode)) {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      const data = new FormData();

      // Add other fields to FormData
      data.append("project_category_id", formData.project_category_id);
      data.append("project_category", formData.project_category);
      data.append("project_name_id", formData.project_name_id);
      data.append("project_name", formData.project_name);
      // data.append("project_location", formData.project_location);
      // data.append("project_info", formData.project_info);
      // data.append(
      //   "project_year_of_completion",
      //   formData.project_year_of_completion
      // );
      // data.append("project_total_tonnage", formData.project_total_tonnage);
      // data.append("project_status", formData.project_status);

      // Check if formData.img is an array and contains files
      console.log(formData.img); // Verify formData.img contains files

      // Append each file from formData.img to FormData
      if (formData.img && Array.isArray(formData.img)) {
        formData.img.forEach((file) => {
          console.log(file); // Log each file to verify they are correct
          data.append("project_images", file); // Append each file individually
        });
      }

      // Log the FormData to check if files are being appended
      for (let pair of data.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      try {
        if (editMode) {
          await instance.put(
            `projectDetailsWithImages/projects/${editingId}/images`,
            data,
            {
              headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          toast.success("Data Updated Successfully");
        } else {
          await instance.post(
            "projectDetailsWithImages/create-projectDetailsWithImages",
            data,
            {
              headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          toast.success("Data Added Successfully");
        }

        fetchTeam();

        setEditMode(false);
        setFormData({});
        setImagePreviews("");
        setShowTable(true);
      } catch (error) {
        console.error("Error handling form submission:", error);
        // toast.error(error);
        if (error.response && error.response.data) {
          if (
            error.response.data.message === "Another project with this name already exists in this category"
          ) {
            toast.error("Project Name already exists for this category");
          } else {
            toast.error(error.response.data.message || "An error occurred");
          }
        } else {
          toast.error("An error occurred while submitting data");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id) => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this data?",
      customUI: ({ onClose }) => (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(5, 5, 5, 0.2)",
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          <FaTrashAlt size={50} color="red" />
          <h2 style={{ marginTop: "15px", fontWeight: "bold" }}>Are you sure?</h2>
          <p style={{ fontSize: "16px", color: "#555" }}>
            Do you really want to delete this record? This action cannot be undone.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <button className="btn btn-secondary" onClick={() => onClose()} style={{ marginRight: "10px" }}>
            Cancel
            </button>
            <button
              style={{ marginRight: "10px" }}
              className="btn btn btn-danger"
              onClick={async () => {
                setLoading(true);
                const accessToken = localStorage.getItem("accessToken");
                try {
                  await instance.delete(
                    `projectDetailsWithImages/projects/${id}/is-delete`,
                    {
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  toast.success("Data Deleted Successfully");
                  fetchTeam();
                } catch (error) {
                  console.error("Error deleting data:", error);
                  toast.error("Error deleting data");
                } finally {
                  setLoading(false);
                }
                onClose();
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
    });
  };
  const handleDelete2 = async (id, imagePath) => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this image?",
      customUI: ({ onClose }) => (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(5, 5, 5, 0.2)",
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          <FaTrashAlt size={50} color="red" />
          <h2 style={{ marginTop: "15px", fontWeight: "bold" }}>Are you sure?</h2>
          <p style={{ fontSize: "16px", color: "#555" }}>
            Do you really want to delete this image? This action cannot be undone.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <button className="btn btn-secondary" onClick={() => onClose()} style={{ marginRight: "10px" }}>
              Cancel
            </button>
            <button
              style={{ marginRight: "10px" }}
              className="btn btn-danger"
              onClick={async () => {
                setLoading(true);
                const accessToken = localStorage.getItem("accessToken");
                try {
                  // Send the image path along with the project ID to the backend
                  await instance.delete(
                    `projectDetailsWithImages/projects/${id}/delete-image`,
                    {
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                      },
                      data: { imagePath: imagePath }, // Sending imagePath in the request body
                    }
                  );
                  toast.success("Image Deleted Successfully");
                  fetchTeam();
                } catch (error) {
                  console.error("Error deleting data:", error);
                  toast.error("Error deleting image");
                } finally {
                  setLoading(false);
                }
                onClose();
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
    });
  };

  const handleIsActive = async (id, isVisible) => {
    confirmAlert({
      title: "Confirm to change visibility",
      customUI: ({ onClose }) => (
        <div
          style={{
            textAlign: "left",
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(5, 5, 5, 0.2)",
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          <h2>Confirm to change visibility</h2>
          <p>
            Are you sure you want to {isVisible ? "hide" : "show"} this data?
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "20px",
            }}
          >
            <button
              style={{ marginRight: "10px" }}
              className="btn btn-primary"
              onClick={async () => {
                setLoading(true);
                const accessToken = localStorage.getItem("accessToken");
                try {
                  await instance.put(
                    `projectDetailsWithImages/projects/${id}/is-active`,
                    { isVisible },
                    {
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  toast.success(
                    `Data ${isVisible ? "hidden" : "shown"} successfully`
                  );
                  setEyeVisibilityById((prev) => ({
                    ...prev,
                    [id]: isVisible,
                  }));
                  fetchTeam();
                } catch (error) {
                  console.error("Error updating visibility:", error);
                  toast.error("Error updating visibility");
                } finally {
                  setLoading(false); // Set loading to false
                }
                onClose();
              }}
            >
              Yes
            </button>
            <button className="btn btn-secondary" onClick={() => onClose()}>
              No
            </button>
          </div>
        </div>
      ),
    });
  };

  const toggleEdit = (id) => {
    const selectedMember = team.find((member) => member.id === id);
    console.log(selectedMember);
    if (!selectedMember) return;

    // Parse `project_images` if it's a stringified JSON array
    let parsedImages = [];
    try {
      parsedImages = JSON.parse(selectedMember.project_images);
    } catch (error) {
      console.error("Error parsing project_images:", error);
    }

    setEditingId(id);
    setFormData({
      ...selectedMember,
      project_images: parsedImages, // Store it as an array
    });

    console.log("%%%%%%%%%%%%%", {
      ...selectedMember,
      project_images: parsedImages,
    });

    setEditMode(true);
    setShowTable(false); // Switch to form view when editing
  };

  const handleAdd = () => {
    setFormData({});
    setEditMode(false);
    setShowTable(false); // Switch to form view when adding new item
  };

  const handleView = () => {
    setFormData({});
    setEditMode(false);
    setShowTable(true);
    // window.location.reload();
  };
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files); // Convert FileList to an array
    console.log(files); // Check if files are correctly selected

    // Validate image size for each file before setting it in formData
    const validFiles = [];
    const invalidFiles = [];
    for (const file of files) {
      try {
        await validateImageSize(file); // Wait for validation to complete
        validFiles.push(file); // If valid, add to valid files
      } catch (error) {
        invalidFiles.push({ file, error }); // If invalid, store the error
      }
    }

    // Update the formData with valid images
    setFormData({
      ...formData,
      img: validFiles, // Store only valid files in formData
    });

    // Create image previews for valid files
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    // Handle invalid files by setting the error messages
    if (invalidFiles.length > 0) {
      const errors = invalidFiles.map((item) => ({
        file: item.file.name,
        error: item.error,
      }));
      setErrors({ img: errors });
    } else {
      setErrors({ img: null }); // Clear previous errors if there are no invalid files
    }
  };

  console.log(formData); // Make sure the files are in formData

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Row>
                {showTable ? (
                  <Col className="d-flex justify-content-end align-items-center">
                    <SearchInput
                      searchQuery={searchQuery}
                      onSearch={handleSearch}
                      onExport={handleExport}
                      showExportButton={false}
                    />
                    <Button
                      variant="outline-success"
                      onClick={handleAdd}
                      className="ms-2 mb-3"
                    >
                      Add
                    </Button>
                  </Col>
                ) : (
                  <Col className="d-flex justify-content-end align-items-center">
                    <Button variant="outline-secondary" onClick={handleView}>
                      View
                    </Button>
                  </Col>
                )}
              </Row>
            </Card.Header>

            <Card.Body>
              {loading ? ( // Check loading state
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "100px" }}
                >
                  <ThreeDots
                    height="80"
                    width="80"
                    radius="9"
                    color="#000"
                    ariaLabel="three-dots-loading"
                    visible={true}
                  />
                </div>
              ) : showTable ? (
                // <DataTable
                //   columns={tableColumns(currentPage, rowsPerPage)}
                //   data={filteredData.length > 0 ? filteredData : team}
                //   pagination
                //   responsive
                //   striped
                //   noDataComponent="No Data Available"
                //   onChangePage={(page) => setCurrentPage(page)}
                //   onChangeRowsPerPage={(rowsPerPage) =>
                //     setRowsPerPage(rowsPerPage)
                //   }
                //   customStyles={{
                //     rows: {
                //       style: {
                //         alignItems: "flex-start", // Aligns text to the top-left corner
                //       },
                //     },
                //     cells: {
                //       style: {
                //         textAlign: "left", // Ensures text is aligned to the left
                //       },
                //     },
                //   }}
                // />
                <DataTable
                columns={tableColumns(currentPage, rowsPerPage)}
                data={searchQuery.length > 0 ? filteredData : team} // Show testimonial initially, filteredData only when searching
                pagination
                responsive
                striped
                noDataComponent="No Data Available" // Show when search returns nothing
                onChangePage={(page) => setCurrentPage(page)}
                onChangeRowsPerPage={(rowsPerPage) => setRowsPerPage(rowsPerPage)}
                customStyles={{
                  rows: {
                    style: {
                      alignItems: "flex-start",
                    },
                  },
                  cells: {
                    style: {
                      textAlign: "left",
                    },
                  },
                }}
              />
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6} className="mt-2">
                      <Form.Group controlId="projectCategory">
                        <Form.Label>Project Category<span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          as="select"
                          value={formData.project_category || ""}
                          onChange={(e) =>
                            handleChange("project_category", e.target.value)
                          }
                          isInvalid={errors.project_category}
                          disabled={editMode} 
                          style={{ appearance: "auto", WebkitAppearance: "auto", MozAppearance: "auto" }} 
                        >
                          <option disabled value="">
                            Choose Category
                          </option>
                          {projectcategory.map((a) => (
                            <option key={a.id} value={a.title}>
                              {a.title}
                            </option>
                          ))}
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                          {errors.project_category}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mt-2">
                      <Form.Group controlId="projectName">
                        <Form.Label>Project Name<span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          as="select"
                          value={formData.project_name || ""}
                          onChange={(e) =>
                            handleChange("project_name", e.target.value)
                          }
                          // disabled={!formData.project_category}
                          disabled={!formData.project_category || editMode}
                          isInvalid={errors.project_name}
                          style={{ appearance: "auto", WebkitAppearance: "auto", MozAppearance: "auto" }} 
                        >
                          <option disabled value="">
                            {formData.project_category
                              ? "Choose Project Name"
                              : "Select a Category First"}
                          </option>
                          {filteredProjectNames.length > 0 ? (
                            filteredProjectNames.map((a) => (
                              <option key={a.id} value={a.project_name}>
                                {a.project_name}
                              </option>
                            ))
                          ) : (
                            <option disabled>No project names available</option>
                          )}
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                          {errors.project_name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* <Col md={6} className="mt-2">
                      <Form.Group controlId="projectLocation">
                        <Form.Label>Project Location</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.project_location || ""}
                          readOnly
                          isInvalid={errors.project_location}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.project_location}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mt-2">
                      <Form.Group controlId="projectTotalTonnage">
                        <Form.Label>Project Total Tonnage</Form.Label>
                        <Form.Control
                          type="text"
                          name="project_total_tonnage"
                          value={formData.project_total_tonnage || ""}
                          onChange={(e) =>
                            handleChange(
                              "project_total_tonnage",
                              e.target.value
                            )
                          }
                          isInvalid={errors.project_total_tonnage}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.project_total_tonnage}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mt-2">
                      <Form.Group controlId="projectYearOfCompletion">
                        <Form.Label>Project Completion Year</Form.Label>
                        <Form.Control
                          type="text"
                          name="project_year_of_completion"
                          value={formData.project_year_of_completion || ""}
                          onChange={(e) =>
                            handleChange(
                              "project_year_of_completion",
                              e.target.value
                            )
                          }
                          isInvalid={errors.project_year_of_completion}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.project_year_of_completion}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mt-2">
                      <Form.Group controlId="projectStatus">
                        <Form.Label>Project Status</Form.Label>
                        <Form.Control
                          type="text"
                          name="project_status"
                          value={formData.project_status || ""}
                          onChange={(e) =>
                            handleChange("project_status", e.target.value)
                          }
                          isInvalid={errors.project_status}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.project_status}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mt-2">
                      <Form.Group controlId="projectInfo">
                        <Form.Label>Project Information</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="project_info"
                          value={formData.project_info || ""}
                          onChange={(e) =>
                            handleChange("project_info", e.target.value)
                          }
                          isInvalid={errors.project_info}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.project_info}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col> */}

                    <Col md={12} className="mt-3">
                      {imagePreview && imagePreview.length > 0 && (
                        <div>
                          {imagePreview.map((preview, index) => (
                            <img
                              key={index}
                              src={preview}
                              alt={`Selected Preview ${index}`}
                              style={{
                                width: "100px",
                                height: "auto",
                                marginBottom: "10px",
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <Col md={12}>
                        {formData.project_images &&
                          formData.project_images.length > 0 && (
                            <div>
                              {formData.project_images.map((preview, index) => (
                                <img
                                  key={index}
                                  src={`${baseURL}${preview}`} // Ensure the correct URL format
                                  alt={`Selected Preview ${index}`}
                                  style={{
                                    width: "100px",
                                    height: "auto",
                                    margin: "10px",
                                  }}
                                />
                              ))}
                            </div>
                          )}
                      </Col>

                      <Form.Group controlId="project_images">
                        <Form.Label>Upload multiple project Images<span className="text-danger">*</span> <small className="text-danger">(Image size must be less than 2MB)</small></Form.Label>
                        <Form.Control
                          type="file"
                          name="project_images"
                          multiple
                          onChange={handleImageChange}
                          isInvalid={errors.img}
                        />
                        {(!editMode || (editMode && errors.img)) &&
                          errors.img && (
                            <Form.Control.Feedback type="invalid">
                              {Array.isArray(errors.img) ? (
                                errors.img.map((err, idx) => (
                                  <div key={idx}>{err.error}</div>
                                ))
                              ) : (
                                <div>{errors.img}</div>
                              )}
                            </Form.Control.Feedback>
                          )}

                        
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <div className="mt-3 d-flex justify-content-end">
                      <Button
                        type="submit"
                        variant={editMode ? "success" : "primary"}
                      >
                        {editMode ? "Update" : "Submit"}
                      </Button>
                    </div>
                  </Row>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectDetailsWithImages;

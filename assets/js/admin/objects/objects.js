DesignAdmin.Login = Em.Object.extend({
	userName: null,
	password: null,
	url: null
});

DesignAdmin.Image = Em.Object.extend({
	imageId: null,
	projectId: null,
	imagePath: null,
	description: null
});


DesignAdmin.Project = Em.Object.extend({
	projectId: null,
	clientId: null,
	thumbnail: null,
	projectType: null,
	description: null,
	isVisible: true,
	images: null
});	

DesignAdmin.Client = Em.Object.extend({
	clientId: null,
	title: null,
	subtitle: null,
	description: null,
	isVisible: true,
	projects: null,
	thumbnail: null,
	client_link: null
});
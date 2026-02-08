// Selectores
const selectCategorias = document.querySelector('#categoria');
const resultado = document.querySelector('#resultado');

// Al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    if (selectCategorias) {
        obtenerCategorias();
        selectCategorias.addEventListener('change', seleccionarCategoria);
    }

    // Si estamos en la página de favoritos
    const favoritosDiv = document.querySelector('#favoritos');
    if (favoritosDiv) {
        mostrarFavoritos();
    }
});

// Obtener categorías de la API
function obtenerCategorias() {
    const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
    
    fetch(url)
        .then(respuesta => respuesta.json())
        .then(datos => {
            mostrarCategorias(datos.categories);
        })
        .catch(error => {
            console.error('Error al obtener categorías:', error);
        });
}

// Mostrar categorías en el select
function mostrarCategorias(categorias) {
    categorias.forEach(categoria => {
        const option = document.createElement('OPTION');
        option.value = categoria.strCategory;
        option.textContent = categoria.strCategory;
        selectCategorias.appendChild(option);
    });
}

// Seleccionar categoría
function seleccionarCategoria(e) {
    const categoria = e.target.value;
    
    if (categoria !== '') {
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;
        
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(datos => {
                mostrarRecetas(datos.meals);
            })
            .catch(error => {
                console.error('Error al obtener recetas:', error);
            });
    } else {
        limpiarHTML(resultado);
    }
}

// Mostrar recetas
function mostrarRecetas(recetas) {
    limpiarHTML(resultado);

    if (!recetas) {
        const mensaje = document.createElement('P');
        mensaje.classList.add('mensaje');
        mensaje.textContent = 'No se encontraron recetas';
        resultado.appendChild(mensaje);
        return;
    }

    recetas.forEach(receta => {
        const { idMeal, strMeal, strMealThumb } = receta;

        const recetaDiv = document.createElement('DIV');
        recetaDiv.classList.add('receta');

        const recetaImg = document.createElement('IMG');
        recetaImg.src = strMealThumb;
        recetaImg.alt = strMeal;

        const recetaInfo = document.createElement('DIV');
        recetaInfo.classList.add('receta-info');

        const recetaNombre = document.createElement('H3');
        recetaNombre.textContent = strMeal;

        const btnGroup = document.createElement('DIV');
        btnGroup.classList.add('btn-group');

        const btnReceta = document.createElement('BUTTON');
        btnReceta.classList.add('btn', 'btn-primary');
        btnReceta.textContent = 'Ver Receta';
        btnReceta.onclick = () => {
            seleccionarReceta(idMeal);
        };

        const btnFavorito = document.createElement('BUTTON');
        btnFavorito.classList.add('btn', 'btn-secondary');
        
        // Verificar si ya está en favoritos
        if (existeFavorito(idMeal)) {
            btnFavorito.textContent = '❤️ En Favoritos';
            btnFavorito.disabled = true;
        } else {
            btnFavorito.textContent = '🤍 Favorito';
            btnFavorito.onclick = () => {
                agregarFavorito({
                    id: idMeal,
                    nombre: strMeal,
                    img: strMealThumb
                });
                btnFavorito.textContent = '❤️ En Favoritos';
                btnFavorito.disabled = true;
            };
        }

        btnGroup.appendChild(btnReceta);
        btnGroup.appendChild(btnFavorito);

        recetaInfo.appendChild(recetaNombre);
        recetaInfo.appendChild(btnGroup);

        recetaDiv.appendChild(recetaImg);
        recetaDiv.appendChild(recetaInfo);

        resultado.appendChild(recetaDiv);
    });
}

// Seleccionar receta y mostrar modal
function seleccionarReceta(id) {
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    
    fetch(url)
        .then(respuesta => respuesta.json())
        .then(datos => {
            mostrarRecetaModal(datos.meals[0]);
        })
        .catch(error => {
            console.error('Error al obtener receta:', error);
        });
}

// Mostrar modal con la receta
function mostrarRecetaModal(receta) {
    const { strMeal, strInstructions, strMealThumb } = receta;

    // Crear modal
    const modal = document.createElement('DIV');
    modal.classList.add('modal');
    modal.style.display = 'block';

    const modalContent = document.createElement('DIV');
    modalContent.classList.add('modal-content');

    const btnCerrar = document.createElement('SPAN');
    btnCerrar.classList.add('close');
    btnCerrar.textContent = '×';
    btnCerrar.onclick = () => {
        modal.remove();
    };

    const titulo = document.createElement('H2');
    titulo.textContent = strMeal;

    const img = document.createElement('IMG');
    img.src = strMealThumb;
    img.alt = strMeal;

    const ingredientesDiv = document.createElement('DIV');
    ingredientesDiv.classList.add('ingredientes');
    
    const ingredientesTitulo = document.createElement('H3');
    ingredientesTitulo.textContent = 'Ingredientes y Cantidades:';
    
    const ingredientesLista = document.createElement('UL');
    
    // Obtener ingredientes y medidas
    for (let i = 1; i <= 20; i++) {
        if (receta[`strIngredient${i}`]) {
            const ingrediente = receta[`strIngredient${i}`];
            const cantidad = receta[`strMeasure${i}`];
            
            const li = document.createElement('LI');
            li.textContent = `${ingrediente} - ${cantidad}`;
            ingredientesLista.appendChild(li);
        }
    }
    
    ingredientesDiv.appendChild(ingredientesTitulo);
    ingredientesDiv.appendChild(ingredientesLista);

    const instruccionesDiv = document.createElement('DIV');
    instruccionesDiv.classList.add('instrucciones');
    
    const instruccionesTitulo = document.createElement('H3');
    instruccionesTitulo.textContent = 'Instrucciones:';
    
    const instruccionesTexto = document.createElement('P');
    instruccionesTexto.textContent = strInstructions;
    
    instruccionesDiv.appendChild(instruccionesTitulo);
    instruccionesDiv.appendChild(instruccionesTexto);

    modalContent.appendChild(btnCerrar);
    modalContent.appendChild(titulo);
    modalContent.appendChild(img);
    modalContent.appendChild(ingredientesDiv);
    modalContent.appendChild(instruccionesDiv);

    modal.appendChild(modalContent);

    // Cerrar modal al hacer clic fuera
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };

    document.body.appendChild(modal);
}

// Funciones de favoritos
function agregarFavorito(receta) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    favoritos.push(receta);
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    
    // Mostrar mensaje
    alert('¡Receta agregada a favoritos!');
}

function obtenerFavoritos() {
    return JSON.parse(localStorage.getItem('favoritos')) || [];
}

function existeFavorito(id) {
    const favoritos = obtenerFavoritos();
    return favoritos.some(favorito => favorito.id === id);
}

function eliminarFavorito(id) {
    const favoritos = obtenerFavoritos();
    const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id);
    localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
    mostrarFavoritos();
}

function mostrarFavoritos() {
    const favoritos = obtenerFavoritos();
    const favoritosDiv = document.querySelector('#favoritos');
    
    limpiarHTML(favoritosDiv);

    if (favoritos.length === 0) {
        const mensaje = document.createElement('P');
        mensaje.classList.add('mensaje');
        mensaje.textContent = 'No tienes recetas favoritas aún';
        favoritosDiv.appendChild(mensaje);
        return;
    }

    favoritos.forEach(receta => {
        const { id, nombre, img } = receta;

        const recetaDiv = document.createElement('DIV');
        recetaDiv.classList.add('receta');

        const recetaImg = document.createElement('IMG');
        recetaImg.src = img;
        recetaImg.alt = nombre;

        const recetaInfo = document.createElement('DIV');
        recetaInfo.classList.add('receta-info');

        const recetaNombre = document.createElement('H3');
        recetaNombre.textContent = nombre;

        const btnGroup = document.createElement('DIV');
        btnGroup.classList.add('btn-group');

        const btnReceta = document.createElement('BUTTON');
        btnReceta.classList.add('btn', 'btn-primary');
        btnReceta.textContent = 'Ver Receta';
        btnReceta.onclick = () => {
            seleccionarReceta(id);
        };

        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = '🗑️ Eliminar';
        btnEliminar.onclick = () => {
            if (confirm('¿Estás seguro de eliminar esta receta de favoritos?')) {
                eliminarFavorito(id);
            }
        };

        btnGroup.appendChild(btnReceta);
        btnGroup.appendChild(btnEliminar);

        recetaInfo.appendChild(recetaNombre);
        recetaInfo.appendChild(btnGroup);

        recetaDiv.appendChild(recetaImg);
        recetaDiv.appendChild(recetaInfo);

        favoritosDiv.appendChild(recetaDiv);
    });
}

// Limpiar HTML
function limpiarHTML(elemento) {
    while (elemento.firstChild) {
        elemento.removeChild(elemento.firstChild);
    }
}
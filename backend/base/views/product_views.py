from django.shortcuts import render
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from base.models import Product, Review
from base.serializer import ProductSerializer


# View for all the products
@api_view(['GET'])
def getProducts(request):
    query = request.query_params.get('keyword')
    if (query == None):
        query = ''

    # Query the DB for all the products
    products = Product.objects.filter(name__icontains = query)

    #getting the page number
    page = request.query_params.get('page')
    paginator = Paginator(products, 4)

    try:
        products = paginator.page(page)
    except PageNotAnInteger:
        products = paginator.page(1)
    except EmptyPage:
        products = paginator.page(paginator.num_pages) 

    if page == None:
        page = 1

    page = int(page)

    serializer = ProductSerializer(products, many = True)
    return Response({'products':serializer.data, 'page': page, 'pages':paginator.num_pages})


# Endpoint for top products
@api_view(['GET'])
def getTopProducts(request):
    products = Product.objects.filter(rating__gte=4).order_by('-rating')[0:5]
    serializer = ProductSerializer(products, many = True)

    return Response(serializer.data)


# Return any single perticular product
@api_view(['GET'])
def getProduct(request, pk):
    product = Product.objects.get(_id = pk)
    serializer = ProductSerializer(product, many = False)

    return Response(serializer.data)


# Creates a new product- Admin Access only
@api_view(['POST'])
@permission_classes([IsAdminUser])
def createProduct(request):
    user = request.user
    # We are going to create a dummy product & Edit the data afterwards
    product = Product.objects.create(
        user = user,
        name = 'Sample Name',
        price = 0,
        brand = 'Sample Brand',
        countInStock = 0,
        category = 'Sample Category',
        description = ''
    )
    serializer = ProductSerializer(product, many = False)
    return Response(serializer.data)


# Updating existing product-Admin access only
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateProduct(request, pk):
    data = request.data
    product = Product.objects.get(_id = pk)

    product.name = data['name']
    product.price = data['price']
    product.brand = data['brand']
    product.countInStock = data['countInStock']
    product.category = data['category']
    product.description = data['description']

    product.save()
    serializer = ProductSerializer(product, many = False)

    return Response(serializer.data)


# Deletes product by ID
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteProduct(request, pk):
    product = Product.objects.get(_id = pk)
    product.delete()

    return Response("Product Deleted")


# Uploads image & assigns it to the DB
@api_view(['POST'])
def uploadImage(request):
    data = request.data

    product_id = data['product_id']
    product = Product.objects.get(_id = product_id)

    product.image = request.FILES.get('image')
    product.save()

    return Response('Image was uploaded!')


# Created product review
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createProductReview(request, pk):
    user = request.user
    product = Product.objects.get(_id = pk)
    data = request.data

    #1- If Review already exists customer is not allowed to write another review
    alreadyExists = product.review_set.filter(user = user).exists()

    if alreadyExists:
        content = {'detail': 'Product already reviewed'}
        return Response(content, status = status.HTTP_400_BAD_REQUEST)


    #2- Rating check for no rating or 0, Customer must have a valid rating
    elif data['rating'] == 0:
        content = {'detail': 'Please select a rating'}
        return Response(content, status = status.HTTP_400_BAD_REQUEST)


    #3- If everything checks out, creating the review
    else: 
        review = Review.objects.create(
            user = user,
            product= product,
            name = user.first_name,
            rating = data['rating'],
            comment = data['comment'],
        )

        reviews = product.review_set.all()
        product.numReviews = len(reviews)

        total = 0
        for i in reviews:
            total += i.rating

        product.rating = (total/len(reviews))
        product.save()

        return Response('Review Added!')
